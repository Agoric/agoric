//@ts-nocheck
import { Any } from '../../../google/protobuf/any.js';
import { SignMode, signModeFromJSON, signModeToJSON, } from '../signing/v1beta1/signing.js';
import { CompactBitArray, } from '../../crypto/multisig/v1beta1/multisig.js';
import { Coin } from '../../base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseTx() {
    return {
        body: undefined,
        authInfo: undefined,
        signatures: [],
    };
}
export const Tx = {
    typeUrl: '/cosmos.tx.v1beta1.Tx',
    encode(message, writer = BinaryWriter.create()) {
        if (message.body !== undefined) {
            TxBody.encode(message.body, writer.uint32(10).fork()).ldelim();
        }
        if (message.authInfo !== undefined) {
            AuthInfo.encode(message.authInfo, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.signatures) {
            writer.uint32(26).bytes(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTx();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.body = TxBody.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.authInfo = AuthInfo.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.signatures.push(reader.bytes());
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
            body: isSet(object.body) ? TxBody.fromJSON(object.body) : undefined,
            authInfo: isSet(object.authInfo)
                ? AuthInfo.fromJSON(object.authInfo)
                : undefined,
            signatures: Array.isArray(object?.signatures)
                ? object.signatures.map((e) => bytesFromBase64(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.body !== undefined &&
            (obj.body = message.body ? TxBody.toJSON(message.body) : undefined);
        message.authInfo !== undefined &&
            (obj.authInfo = message.authInfo
                ? AuthInfo.toJSON(message.authInfo)
                : undefined);
        if (message.signatures) {
            obj.signatures = message.signatures.map(e => base64FromBytes(e !== undefined ? e : new Uint8Array()));
        }
        else {
            obj.signatures = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTx();
        message.body =
            object.body !== undefined && object.body !== null
                ? TxBody.fromPartial(object.body)
                : undefined;
        message.authInfo =
            object.authInfo !== undefined && object.authInfo !== null
                ? AuthInfo.fromPartial(object.authInfo)
                : undefined;
        message.signatures = object.signatures?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Tx.decode(message.value);
    },
    toProto(message) {
        return Tx.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.Tx',
            value: Tx.encode(message).finish(),
        };
    },
};
function createBaseTxRaw() {
    return {
        bodyBytes: new Uint8Array(),
        authInfoBytes: new Uint8Array(),
        signatures: [],
    };
}
export const TxRaw = {
    typeUrl: '/cosmos.tx.v1beta1.TxRaw',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bodyBytes.length !== 0) {
            writer.uint32(10).bytes(message.bodyBytes);
        }
        if (message.authInfoBytes.length !== 0) {
            writer.uint32(18).bytes(message.authInfoBytes);
        }
        for (const v of message.signatures) {
            writer.uint32(26).bytes(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxRaw();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bodyBytes = reader.bytes();
                    break;
                case 2:
                    message.authInfoBytes = reader.bytes();
                    break;
                case 3:
                    message.signatures.push(reader.bytes());
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
            bodyBytes: isSet(object.bodyBytes)
                ? bytesFromBase64(object.bodyBytes)
                : new Uint8Array(),
            authInfoBytes: isSet(object.authInfoBytes)
                ? bytesFromBase64(object.authInfoBytes)
                : new Uint8Array(),
            signatures: Array.isArray(object?.signatures)
                ? object.signatures.map((e) => bytesFromBase64(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.bodyBytes !== undefined &&
            (obj.bodyBytes = base64FromBytes(message.bodyBytes !== undefined ? message.bodyBytes : new Uint8Array()));
        message.authInfoBytes !== undefined &&
            (obj.authInfoBytes = base64FromBytes(message.authInfoBytes !== undefined
                ? message.authInfoBytes
                : new Uint8Array()));
        if (message.signatures) {
            obj.signatures = message.signatures.map(e => base64FromBytes(e !== undefined ? e : new Uint8Array()));
        }
        else {
            obj.signatures = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxRaw();
        message.bodyBytes = object.bodyBytes ?? new Uint8Array();
        message.authInfoBytes = object.authInfoBytes ?? new Uint8Array();
        message.signatures = object.signatures?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TxRaw.decode(message.value);
    },
    toProto(message) {
        return TxRaw.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.TxRaw',
            value: TxRaw.encode(message).finish(),
        };
    },
};
function createBaseSignDoc() {
    return {
        bodyBytes: new Uint8Array(),
        authInfoBytes: new Uint8Array(),
        chainId: '',
        accountNumber: BigInt(0),
    };
}
export const SignDoc = {
    typeUrl: '/cosmos.tx.v1beta1.SignDoc',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bodyBytes.length !== 0) {
            writer.uint32(10).bytes(message.bodyBytes);
        }
        if (message.authInfoBytes.length !== 0) {
            writer.uint32(18).bytes(message.authInfoBytes);
        }
        if (message.chainId !== '') {
            writer.uint32(26).string(message.chainId);
        }
        if (message.accountNumber !== BigInt(0)) {
            writer.uint32(32).uint64(message.accountNumber);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignDoc();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bodyBytes = reader.bytes();
                    break;
                case 2:
                    message.authInfoBytes = reader.bytes();
                    break;
                case 3:
                    message.chainId = reader.string();
                    break;
                case 4:
                    message.accountNumber = reader.uint64();
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
            bodyBytes: isSet(object.bodyBytes)
                ? bytesFromBase64(object.bodyBytes)
                : new Uint8Array(),
            authInfoBytes: isSet(object.authInfoBytes)
                ? bytesFromBase64(object.authInfoBytes)
                : new Uint8Array(),
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            accountNumber: isSet(object.accountNumber)
                ? BigInt(object.accountNumber.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.bodyBytes !== undefined &&
            (obj.bodyBytes = base64FromBytes(message.bodyBytes !== undefined ? message.bodyBytes : new Uint8Array()));
        message.authInfoBytes !== undefined &&
            (obj.authInfoBytes = base64FromBytes(message.authInfoBytes !== undefined
                ? message.authInfoBytes
                : new Uint8Array()));
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.accountNumber !== undefined &&
            (obj.accountNumber = (message.accountNumber || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSignDoc();
        message.bodyBytes = object.bodyBytes ?? new Uint8Array();
        message.authInfoBytes = object.authInfoBytes ?? new Uint8Array();
        message.chainId = object.chainId ?? '';
        message.accountNumber =
            object.accountNumber !== undefined && object.accountNumber !== null
                ? BigInt(object.accountNumber.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return SignDoc.decode(message.value);
    },
    toProto(message) {
        return SignDoc.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.SignDoc',
            value: SignDoc.encode(message).finish(),
        };
    },
};
function createBaseSignDocDirectAux() {
    return {
        bodyBytes: new Uint8Array(),
        publicKey: undefined,
        chainId: '',
        accountNumber: BigInt(0),
        sequence: BigInt(0),
        tip: undefined,
    };
}
export const SignDocDirectAux = {
    typeUrl: '/cosmos.tx.v1beta1.SignDocDirectAux',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bodyBytes.length !== 0) {
            writer.uint32(10).bytes(message.bodyBytes);
        }
        if (message.publicKey !== undefined) {
            Any.encode(message.publicKey, writer.uint32(18).fork()).ldelim();
        }
        if (message.chainId !== '') {
            writer.uint32(26).string(message.chainId);
        }
        if (message.accountNumber !== BigInt(0)) {
            writer.uint32(32).uint64(message.accountNumber);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(40).uint64(message.sequence);
        }
        if (message.tip !== undefined) {
            Tip.encode(message.tip, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignDocDirectAux();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bodyBytes = reader.bytes();
                    break;
                case 2:
                    message.publicKey = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.chainId = reader.string();
                    break;
                case 4:
                    message.accountNumber = reader.uint64();
                    break;
                case 5:
                    message.sequence = reader.uint64();
                    break;
                case 6:
                    message.tip = Tip.decode(reader, reader.uint32());
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
            bodyBytes: isSet(object.bodyBytes)
                ? bytesFromBase64(object.bodyBytes)
                : new Uint8Array(),
            publicKey: isSet(object.publicKey)
                ? Any.fromJSON(object.publicKey)
                : undefined,
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            accountNumber: isSet(object.accountNumber)
                ? BigInt(object.accountNumber.toString())
                : BigInt(0),
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
            tip: isSet(object.tip) ? Tip.fromJSON(object.tip) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.bodyBytes !== undefined &&
            (obj.bodyBytes = base64FromBytes(message.bodyBytes !== undefined ? message.bodyBytes : new Uint8Array()));
        message.publicKey !== undefined &&
            (obj.publicKey = message.publicKey
                ? Any.toJSON(message.publicKey)
                : undefined);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.accountNumber !== undefined &&
            (obj.accountNumber = (message.accountNumber || BigInt(0)).toString());
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        message.tip !== undefined &&
            (obj.tip = message.tip ? Tip.toJSON(message.tip) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSignDocDirectAux();
        message.bodyBytes = object.bodyBytes ?? new Uint8Array();
        message.publicKey =
            object.publicKey !== undefined && object.publicKey !== null
                ? Any.fromPartial(object.publicKey)
                : undefined;
        message.chainId = object.chainId ?? '';
        message.accountNumber =
            object.accountNumber !== undefined && object.accountNumber !== null
                ? BigInt(object.accountNumber.toString())
                : BigInt(0);
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        message.tip =
            object.tip !== undefined && object.tip !== null
                ? Tip.fromPartial(object.tip)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return SignDocDirectAux.decode(message.value);
    },
    toProto(message) {
        return SignDocDirectAux.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.SignDocDirectAux',
            value: SignDocDirectAux.encode(message).finish(),
        };
    },
};
function createBaseTxBody() {
    return {
        messages: [],
        memo: '',
        timeoutHeight: BigInt(0),
        extensionOptions: [],
        nonCriticalExtensionOptions: [],
    };
}
export const TxBody = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.messages) {
            Any.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.memo !== '') {
            writer.uint32(18).string(message.memo);
        }
        if (message.timeoutHeight !== BigInt(0)) {
            writer.uint32(24).uint64(message.timeoutHeight);
        }
        for (const v of message.extensionOptions) {
            Any.encode(v, writer.uint32(8186).fork()).ldelim();
        }
        for (const v of message.nonCriticalExtensionOptions) {
            Any.encode(v, writer.uint32(16378).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.messages.push(Any.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.memo = reader.string();
                    break;
                case 3:
                    message.timeoutHeight = reader.uint64();
                    break;
                case 1023:
                    message.extensionOptions.push(Any.decode(reader, reader.uint32()));
                    break;
                case 2047:
                    message.nonCriticalExtensionOptions.push(Any.decode(reader, reader.uint32()));
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
                ? object.messages.map((e) => Any.fromJSON(e))
                : [],
            memo: isSet(object.memo) ? String(object.memo) : '',
            timeoutHeight: isSet(object.timeoutHeight)
                ? BigInt(object.timeoutHeight.toString())
                : BigInt(0),
            extensionOptions: Array.isArray(object?.extensionOptions)
                ? object.extensionOptions.map((e) => Any.fromJSON(e))
                : [],
            nonCriticalExtensionOptions: Array.isArray(object?.nonCriticalExtensionOptions)
                ? object.nonCriticalExtensionOptions.map((e) => Any.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.messages) {
            obj.messages = message.messages.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.messages = [];
        }
        message.memo !== undefined && (obj.memo = message.memo);
        message.timeoutHeight !== undefined &&
            (obj.timeoutHeight = (message.timeoutHeight || BigInt(0)).toString());
        if (message.extensionOptions) {
            obj.extensionOptions = message.extensionOptions.map(e => e ? Any.toJSON(e) : undefined);
        }
        else {
            obj.extensionOptions = [];
        }
        if (message.nonCriticalExtensionOptions) {
            obj.nonCriticalExtensionOptions = message.nonCriticalExtensionOptions.map(e => (e ? Any.toJSON(e) : undefined));
        }
        else {
            obj.nonCriticalExtensionOptions = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTxBody();
        message.messages = object.messages?.map(e => Any.fromPartial(e)) || [];
        message.memo = object.memo ?? '';
        message.timeoutHeight =
            object.timeoutHeight !== undefined && object.timeoutHeight !== null
                ? BigInt(object.timeoutHeight.toString())
                : BigInt(0);
        message.extensionOptions =
            object.extensionOptions?.map(e => Any.fromPartial(e)) || [];
        message.nonCriticalExtensionOptions =
            object.nonCriticalExtensionOptions?.map(e => Any.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TxBody.decode(message.value);
    },
    toProto(message) {
        return TxBody.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.TxBody',
            value: TxBody.encode(message).finish(),
        };
    },
};
function createBaseAuthInfo() {
    return {
        signerInfos: [],
        fee: undefined,
        tip: undefined,
    };
}
export const AuthInfo = {
    typeUrl: '/cosmos.tx.v1beta1.AuthInfo',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.signerInfos) {
            SignerInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.fee !== undefined) {
            Fee.encode(message.fee, writer.uint32(18).fork()).ldelim();
        }
        if (message.tip !== undefined) {
            Tip.encode(message.tip, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuthInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signerInfos.push(SignerInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.fee = Fee.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.tip = Tip.decode(reader, reader.uint32());
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
            signerInfos: Array.isArray(object?.signerInfos)
                ? object.signerInfos.map((e) => SignerInfo.fromJSON(e))
                : [],
            fee: isSet(object.fee) ? Fee.fromJSON(object.fee) : undefined,
            tip: isSet(object.tip) ? Tip.fromJSON(object.tip) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.signerInfos) {
            obj.signerInfos = message.signerInfos.map(e => e ? SignerInfo.toJSON(e) : undefined);
        }
        else {
            obj.signerInfos = [];
        }
        message.fee !== undefined &&
            (obj.fee = message.fee ? Fee.toJSON(message.fee) : undefined);
        message.tip !== undefined &&
            (obj.tip = message.tip ? Tip.toJSON(message.tip) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAuthInfo();
        message.signerInfos =
            object.signerInfos?.map(e => SignerInfo.fromPartial(e)) || [];
        message.fee =
            object.fee !== undefined && object.fee !== null
                ? Fee.fromPartial(object.fee)
                : undefined;
        message.tip =
            object.tip !== undefined && object.tip !== null
                ? Tip.fromPartial(object.tip)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return AuthInfo.decode(message.value);
    },
    toProto(message) {
        return AuthInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.AuthInfo',
            value: AuthInfo.encode(message).finish(),
        };
    },
};
function createBaseSignerInfo() {
    return {
        publicKey: undefined,
        modeInfo: undefined,
        sequence: BigInt(0),
    };
}
export const SignerInfo = {
    typeUrl: '/cosmos.tx.v1beta1.SignerInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.publicKey !== undefined) {
            Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
        }
        if (message.modeInfo !== undefined) {
            ModeInfo.encode(message.modeInfo, writer.uint32(18).fork()).ldelim();
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(24).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignerInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.publicKey = Any.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.modeInfo = ModeInfo.decode(reader, reader.uint32());
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
            publicKey: isSet(object.publicKey)
                ? Any.fromJSON(object.publicKey)
                : undefined,
            modeInfo: isSet(object.modeInfo)
                ? ModeInfo.fromJSON(object.modeInfo)
                : undefined,
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.publicKey !== undefined &&
            (obj.publicKey = message.publicKey
                ? Any.toJSON(message.publicKey)
                : undefined);
        message.modeInfo !== undefined &&
            (obj.modeInfo = message.modeInfo
                ? ModeInfo.toJSON(message.modeInfo)
                : undefined);
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSignerInfo();
        message.publicKey =
            object.publicKey !== undefined && object.publicKey !== null
                ? Any.fromPartial(object.publicKey)
                : undefined;
        message.modeInfo =
            object.modeInfo !== undefined && object.modeInfo !== null
                ? ModeInfo.fromPartial(object.modeInfo)
                : undefined;
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return SignerInfo.decode(message.value);
    },
    toProto(message) {
        return SignerInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.SignerInfo',
            value: SignerInfo.encode(message).finish(),
        };
    },
};
function createBaseModeInfo() {
    return {
        single: undefined,
        multi: undefined,
    };
}
export const ModeInfo = {
    typeUrl: '/cosmos.tx.v1beta1.ModeInfo',
    encode(message, writer = BinaryWriter.create()) {
        if (message.single !== undefined) {
            ModeInfo_Single.encode(message.single, writer.uint32(10).fork()).ldelim();
        }
        if (message.multi !== undefined) {
            ModeInfo_Multi.encode(message.multi, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseModeInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.single = ModeInfo_Single.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.multi = ModeInfo_Multi.decode(reader, reader.uint32());
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
            single: isSet(object.single)
                ? ModeInfo_Single.fromJSON(object.single)
                : undefined,
            multi: isSet(object.multi)
                ? ModeInfo_Multi.fromJSON(object.multi)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.single !== undefined &&
            (obj.single = message.single
                ? ModeInfo_Single.toJSON(message.single)
                : undefined);
        message.multi !== undefined &&
            (obj.multi = message.multi
                ? ModeInfo_Multi.toJSON(message.multi)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseModeInfo();
        message.single =
            object.single !== undefined && object.single !== null
                ? ModeInfo_Single.fromPartial(object.single)
                : undefined;
        message.multi =
            object.multi !== undefined && object.multi !== null
                ? ModeInfo_Multi.fromPartial(object.multi)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ModeInfo.decode(message.value);
    },
    toProto(message) {
        return ModeInfo.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.ModeInfo',
            value: ModeInfo.encode(message).finish(),
        };
    },
};
function createBaseModeInfo_Single() {
    return {
        mode: 0,
    };
}
export const ModeInfo_Single = {
    typeUrl: '/cosmos.tx.v1beta1.Single',
    encode(message, writer = BinaryWriter.create()) {
        if (message.mode !== 0) {
            writer.uint32(8).int32(message.mode);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseModeInfo_Single();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.mode = reader.int32();
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
            mode: isSet(object.mode) ? signModeFromJSON(object.mode) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.mode !== undefined && (obj.mode = signModeToJSON(message.mode));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseModeInfo_Single();
        message.mode = object.mode ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return ModeInfo_Single.decode(message.value);
    },
    toProto(message) {
        return ModeInfo_Single.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.Single',
            value: ModeInfo_Single.encode(message).finish(),
        };
    },
};
function createBaseModeInfo_Multi() {
    return {
        bitarray: undefined,
        modeInfos: [],
    };
}
export const ModeInfo_Multi = {
    typeUrl: '/cosmos.tx.v1beta1.Multi',
    encode(message, writer = BinaryWriter.create()) {
        if (message.bitarray !== undefined) {
            CompactBitArray.encode(message.bitarray, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.modeInfos) {
            ModeInfo.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseModeInfo_Multi();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bitarray = CompactBitArray.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.modeInfos.push(ModeInfo.decode(reader, reader.uint32()));
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
            bitarray: isSet(object.bitarray)
                ? CompactBitArray.fromJSON(object.bitarray)
                : undefined,
            modeInfos: Array.isArray(object?.modeInfos)
                ? object.modeInfos.map((e) => ModeInfo.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.bitarray !== undefined &&
            (obj.bitarray = message.bitarray
                ? CompactBitArray.toJSON(message.bitarray)
                : undefined);
        if (message.modeInfos) {
            obj.modeInfos = message.modeInfos.map(e => e ? ModeInfo.toJSON(e) : undefined);
        }
        else {
            obj.modeInfos = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseModeInfo_Multi();
        message.bitarray =
            object.bitarray !== undefined && object.bitarray !== null
                ? CompactBitArray.fromPartial(object.bitarray)
                : undefined;
        message.modeInfos =
            object.modeInfos?.map(e => ModeInfo.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return ModeInfo_Multi.decode(message.value);
    },
    toProto(message) {
        return ModeInfo_Multi.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.Multi',
            value: ModeInfo_Multi.encode(message).finish(),
        };
    },
};
function createBaseFee() {
    return {
        amount: [],
        gasLimit: BigInt(0),
        payer: '',
        granter: '',
    };
}
export const Fee = {
    typeUrl: '/cosmos.tx.v1beta1.Fee',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.gasLimit !== BigInt(0)) {
            writer.uint32(16).uint64(message.gasLimit);
        }
        if (message.payer !== '') {
            writer.uint32(26).string(message.payer);
        }
        if (message.granter !== '') {
            writer.uint32(34).string(message.granter);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseFee();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.gasLimit = reader.uint64();
                    break;
                case 3:
                    message.payer = reader.string();
                    break;
                case 4:
                    message.granter = reader.string();
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
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
            gasLimit: isSet(object.gasLimit)
                ? BigInt(object.gasLimit.toString())
                : BigInt(0),
            payer: isSet(object.payer) ? String(object.payer) : '',
            granter: isSet(object.granter) ? String(object.granter) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        message.gasLimit !== undefined &&
            (obj.gasLimit = (message.gasLimit || BigInt(0)).toString());
        message.payer !== undefined && (obj.payer = message.payer);
        message.granter !== undefined && (obj.granter = message.granter);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseFee();
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        message.gasLimit =
            object.gasLimit !== undefined && object.gasLimit !== null
                ? BigInt(object.gasLimit.toString())
                : BigInt(0);
        message.payer = object.payer ?? '';
        message.granter = object.granter ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Fee.decode(message.value);
    },
    toProto(message) {
        return Fee.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.Fee',
            value: Fee.encode(message).finish(),
        };
    },
};
function createBaseTip() {
    return {
        amount: [],
        tipper: '',
    };
}
export const Tip = {
    typeUrl: '/cosmos.tx.v1beta1.Tip',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.amount) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.tipper !== '') {
            writer.uint32(18).string(message.tipper);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTip();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.amount.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.tipper = reader.string();
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
            amount: Array.isArray(object?.amount)
                ? object.amount.map((e) => Coin.fromJSON(e))
                : [],
            tipper: isSet(object.tipper) ? String(object.tipper) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.amount) {
            obj.amount = message.amount.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.amount = [];
        }
        message.tipper !== undefined && (obj.tipper = message.tipper);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTip();
        message.amount = object.amount?.map(e => Coin.fromPartial(e)) || [];
        message.tipper = object.tipper ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return Tip.decode(message.value);
    },
    toProto(message) {
        return Tip.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.Tip',
            value: Tip.encode(message).finish(),
        };
    },
};
function createBaseAuxSignerData() {
    return {
        address: '',
        signDoc: undefined,
        mode: 0,
        sig: new Uint8Array(),
    };
}
export const AuxSignerData = {
    typeUrl: '/cosmos.tx.v1beta1.AuxSignerData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.signDoc !== undefined) {
            SignDocDirectAux.encode(message.signDoc, writer.uint32(18).fork()).ldelim();
        }
        if (message.mode !== 0) {
            writer.uint32(24).int32(message.mode);
        }
        if (message.sig.length !== 0) {
            writer.uint32(34).bytes(message.sig);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAuxSignerData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.signDoc = SignDocDirectAux.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.mode = reader.int32();
                    break;
                case 4:
                    message.sig = reader.bytes();
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
            signDoc: isSet(object.signDoc)
                ? SignDocDirectAux.fromJSON(object.signDoc)
                : undefined,
            mode: isSet(object.mode) ? signModeFromJSON(object.mode) : -1,
            sig: isSet(object.sig) ? bytesFromBase64(object.sig) : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.signDoc !== undefined &&
            (obj.signDoc = message.signDoc
                ? SignDocDirectAux.toJSON(message.signDoc)
                : undefined);
        message.mode !== undefined && (obj.mode = signModeToJSON(message.mode));
        message.sig !== undefined &&
            (obj.sig = base64FromBytes(message.sig !== undefined ? message.sig : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAuxSignerData();
        message.address = object.address ?? '';
        message.signDoc =
            object.signDoc !== undefined && object.signDoc !== null
                ? SignDocDirectAux.fromPartial(object.signDoc)
                : undefined;
        message.mode = object.mode ?? 0;
        message.sig = object.sig ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return AuxSignerData.decode(message.value);
    },
    toProto(message) {
        return AuxSignerData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.tx.v1beta1.AuxSignerData',
            value: AuxSignerData.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map