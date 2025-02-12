//@ts-nocheck
import { CommitmentProof, } from '../../../../proofs.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet, bytesFromBase64, base64FromBytes, } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseMerkleRoot() {
    return {
        hash: new Uint8Array(),
    };
}
export const MerkleRoot = {
    typeUrl: '/ibc.core.commitment.v1.MerkleRoot',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hash.length !== 0) {
            writer.uint32(10).bytes(message.hash);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMerkleRoot();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hash = reader.bytes();
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
            hash: isSet(object.hash)
                ? bytesFromBase64(object.hash)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.hash !== undefined &&
            (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMerkleRoot();
        message.hash = object.hash ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MerkleRoot.decode(message.value);
    },
    toProto(message) {
        return MerkleRoot.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.commitment.v1.MerkleRoot',
            value: MerkleRoot.encode(message).finish(),
        };
    },
};
function createBaseMerklePrefix() {
    return {
        keyPrefix: new Uint8Array(),
    };
}
export const MerklePrefix = {
    typeUrl: '/ibc.core.commitment.v1.MerklePrefix',
    encode(message, writer = BinaryWriter.create()) {
        if (message.keyPrefix.length !== 0) {
            writer.uint32(10).bytes(message.keyPrefix);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMerklePrefix();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.keyPrefix = reader.bytes();
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
            keyPrefix: isSet(object.keyPrefix)
                ? bytesFromBase64(object.keyPrefix)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.keyPrefix !== undefined &&
            (obj.keyPrefix = base64FromBytes(message.keyPrefix !== undefined ? message.keyPrefix : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMerklePrefix();
        message.keyPrefix = object.keyPrefix ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return MerklePrefix.decode(message.value);
    },
    toProto(message) {
        return MerklePrefix.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.commitment.v1.MerklePrefix',
            value: MerklePrefix.encode(message).finish(),
        };
    },
};
function createBaseMerklePath() {
    return {
        keyPath: [],
    };
}
export const MerklePath = {
    typeUrl: '/ibc.core.commitment.v1.MerklePath',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.keyPath) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMerklePath();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.keyPath.push(reader.string());
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
            keyPath: Array.isArray(object?.keyPath)
                ? object.keyPath.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.keyPath) {
            obj.keyPath = message.keyPath.map(e => e);
        }
        else {
            obj.keyPath = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMerklePath();
        message.keyPath = object.keyPath?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MerklePath.decode(message.value);
    },
    toProto(message) {
        return MerklePath.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.commitment.v1.MerklePath',
            value: MerklePath.encode(message).finish(),
        };
    },
};
function createBaseMerkleProof() {
    return {
        proofs: [],
    };
}
export const MerkleProof = {
    typeUrl: '/ibc.core.commitment.v1.MerkleProof',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.proofs) {
            CommitmentProof.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMerkleProof();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.proofs.push(CommitmentProof.decode(reader, reader.uint32()));
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
            proofs: Array.isArray(object?.proofs)
                ? object.proofs.map((e) => CommitmentProof.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.proofs) {
            obj.proofs = message.proofs.map(e => e ? CommitmentProof.toJSON(e) : undefined);
        }
        else {
            obj.proofs = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMerkleProof();
        message.proofs =
            object.proofs?.map(e => CommitmentProof.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MerkleProof.decode(message.value);
    },
    toProto(message) {
        return MerkleProof.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.core.commitment.v1.MerkleProof',
            value: MerkleProof.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=commitment.js.map