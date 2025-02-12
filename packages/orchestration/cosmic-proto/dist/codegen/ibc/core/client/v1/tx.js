//@ts-nocheck
import { Any } from '../../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseMsgCreateClient() {
    return {
        clientState: undefined,
        consensusState: undefined,
        signer: '',
    };
}
export const MsgCreateClient = {
    typeUrl: '/ibc.core.client.v1.MsgCreateClient',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(10).fork()).ldelim();
        }
        if (message.consensusState !== undefined) {
            Any.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(26).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClient();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientState = Any.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.consensusState = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.signer = reader.string();
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
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
                : undefined,
            consensusState: isSet(object.consensusState)
                ? Any.fromJSON(object.consensusState)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
                : undefined);
        message.consensusState !== undefined &&
            (obj.consensusState = message.consensusState
                ? Any.toJSON(message.consensusState)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateClient();
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        message.consensusState =
            object.consensusState !== undefined && object.consensusState !== null
                ? Any.fromPartial(object.consensusState)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateClient.decode(message.value);
    },
    toProto(message) {
        return MsgCreateClient.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgCreateClient',
            value: MsgCreateClient.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateClientResponse() {
    return {};
}
export const MsgCreateClientResponse = {
    typeUrl: '/ibc.core.client.v1.MsgCreateClientResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClientResponse();
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
        const message = createBaseMsgCreateClientResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateClientResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateClientResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgCreateClientResponse',
            value: MsgCreateClientResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateClient() {
    return {
        clientId: '',
        header: undefined,
        signer: '',
    };
}
export const MsgUpdateClient = {
    typeUrl: '/ibc.core.client.v1.MsgUpdateClient',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.header !== undefined) {
            Any.encode(message.header, writer.uint32(18).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(26).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateClient();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.header = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.signer = reader.string();
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
            header: isSet(object.header) ? Any.fromJSON(object.header) : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.header !== undefined &&
            (obj.header = message.header ? Any.toJSON(message.header) : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateClient();
        message.clientId = object.clientId ?? '';
        message.header =
            object.header !== undefined && object.header !== null
                ? Any.fromPartial(object.header)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateClient.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateClient.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgUpdateClient',
            value: MsgUpdateClient.encode(message).finish(),
        };
    },
};
function createBaseMsgUpdateClientResponse() {
    return {};
}
export const MsgUpdateClientResponse = {
    typeUrl: '/ibc.core.client.v1.MsgUpdateClientResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateClientResponse();
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
        const message = createBaseMsgUpdateClientResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpdateClientResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpdateClientResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgUpdateClientResponse',
            value: MsgUpdateClientResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgUpgradeClient() {
    return {
        clientId: '',
        clientState: undefined,
        consensusState: undefined,
        proofUpgradeClient: new Uint8Array(),
        proofUpgradeConsensusState: new Uint8Array(),
        signer: '',
    };
}
export const MsgUpgradeClient = {
    typeUrl: '/ibc.core.client.v1.MsgUpgradeClient',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.clientState !== undefined) {
            Any.encode(message.clientState, writer.uint32(18).fork()).ldelim();
        }
        if (message.consensusState !== undefined) {
            Any.encode(message.consensusState, writer.uint32(26).fork()).ldelim();
        }
        if (message.proofUpgradeClient.length !== 0) {
            writer.uint32(34).bytes(message.proofUpgradeClient);
        }
        if (message.proofUpgradeConsensusState.length !== 0) {
            writer.uint32(42).bytes(message.proofUpgradeConsensusState);
        }
        if (message.signer !== '') {
            writer.uint32(50).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpgradeClient();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.clientState = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.consensusState = Any.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.proofUpgradeClient = reader.bytes();
                    break;
                case 5:
                    message.proofUpgradeConsensusState = reader.bytes();
                    break;
                case 6:
                    message.signer = reader.string();
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
            clientState: isSet(object.clientState)
                ? Any.fromJSON(object.clientState)
                : undefined,
            consensusState: isSet(object.consensusState)
                ? Any.fromJSON(object.consensusState)
                : undefined,
            proofUpgradeClient: isSet(object.proofUpgradeClient)
                ? bytesFromBase64(object.proofUpgradeClient)
                : new Uint8Array(),
            proofUpgradeConsensusState: isSet(object.proofUpgradeConsensusState)
                ? bytesFromBase64(object.proofUpgradeConsensusState)
                : new Uint8Array(),
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.clientState !== undefined &&
            (obj.clientState = message.clientState
                ? Any.toJSON(message.clientState)
                : undefined);
        message.consensusState !== undefined &&
            (obj.consensusState = message.consensusState
                ? Any.toJSON(message.consensusState)
                : undefined);
        message.proofUpgradeClient !== undefined &&
            (obj.proofUpgradeClient = base64FromBytes(message.proofUpgradeClient !== undefined
                ? message.proofUpgradeClient
                : new Uint8Array()));
        message.proofUpgradeConsensusState !== undefined &&
            (obj.proofUpgradeConsensusState = base64FromBytes(message.proofUpgradeConsensusState !== undefined
                ? message.proofUpgradeConsensusState
                : new Uint8Array()));
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgUpgradeClient();
        message.clientId = object.clientId ?? '';
        message.clientState =
            object.clientState !== undefined && object.clientState !== null
                ? Any.fromPartial(object.clientState)
                : undefined;
        message.consensusState =
            object.consensusState !== undefined && object.consensusState !== null
                ? Any.fromPartial(object.consensusState)
                : undefined;
        message.proofUpgradeClient = object.proofUpgradeClient ?? new Uint8Array();
        message.proofUpgradeConsensusState =
            object.proofUpgradeConsensusState ?? new Uint8Array();
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpgradeClient.decode(message.value);
    },
    toProto(message) {
        return MsgUpgradeClient.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgUpgradeClient',
            value: MsgUpgradeClient.encode(message).finish(),
        };
    },
};
function createBaseMsgUpgradeClientResponse() {
    return {};
}
export const MsgUpgradeClientResponse = {
    typeUrl: '/ibc.core.client.v1.MsgUpgradeClientResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpgradeClientResponse();
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
        const message = createBaseMsgUpgradeClientResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgUpgradeClientResponse.decode(message.value);
    },
    toProto(message) {
        return MsgUpgradeClientResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgUpgradeClientResponse',
            value: MsgUpgradeClientResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgSubmitMisbehaviour() {
    return {
        clientId: '',
        misbehaviour: undefined,
        signer: '',
    };
}
export const MsgSubmitMisbehaviour = {
    typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviour',
    encode(message, writer = BinaryWriter.create()) {
        if (message.clientId !== '') {
            writer.uint32(10).string(message.clientId);
        }
        if (message.misbehaviour !== undefined) {
            Any.encode(message.misbehaviour, writer.uint32(18).fork()).ldelim();
        }
        if (message.signer !== '') {
            writer.uint32(26).string(message.signer);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitMisbehaviour();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clientId = reader.string();
                    break;
                case 2:
                    message.misbehaviour = Any.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.signer = reader.string();
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
            misbehaviour: isSet(object.misbehaviour)
                ? Any.fromJSON(object.misbehaviour)
                : undefined,
            signer: isSet(object.signer) ? String(object.signer) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.clientId !== undefined && (obj.clientId = message.clientId);
        message.misbehaviour !== undefined &&
            (obj.misbehaviour = message.misbehaviour
                ? Any.toJSON(message.misbehaviour)
                : undefined);
        message.signer !== undefined && (obj.signer = message.signer);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSubmitMisbehaviour();
        message.clientId = object.clientId ?? '';
        message.misbehaviour =
            object.misbehaviour !== undefined && object.misbehaviour !== null
                ? Any.fromPartial(object.misbehaviour)
                : undefined;
        message.signer = object.signer ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitMisbehaviour.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitMisbehaviour.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviour',
            value: MsgSubmitMisbehaviour.encode(message).finish(),
        };
    },
};
function createBaseMsgSubmitMisbehaviourResponse() {
    return {};
}
export const MsgSubmitMisbehaviourResponse = {
    typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviourResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSubmitMisbehaviourResponse();
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
        const message = createBaseMsgSubmitMisbehaviourResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSubmitMisbehaviourResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSubmitMisbehaviourResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.client.v1.MsgSubmitMisbehaviourResponse',
            value: MsgSubmitMisbehaviourResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map