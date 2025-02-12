//@ts-nocheck
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseMsgSetAirdropAllocations() {
    return {
        allocator: '',
        airdropIdentifier: '',
        users: [],
        weights: [],
    };
}
export const MsgSetAirdropAllocations = {
    typeUrl: '/stride.claim.MsgSetAirdropAllocations',
    encode(message, writer = BinaryWriter.create()) {
        if (message.allocator !== '') {
            writer.uint32(10).string(message.allocator);
        }
        if (message.airdropIdentifier !== '') {
            writer.uint32(18).string(message.airdropIdentifier);
        }
        for (const v of message.users) {
            writer.uint32(26).string(v);
        }
        for (const v of message.weights) {
            writer.uint32(34).string(Decimal.fromUserInput(v, 18).atomics);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetAirdropAllocations();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.allocator = reader.string();
                    break;
                case 2:
                    message.airdropIdentifier = reader.string();
                    break;
                case 3:
                    message.users.push(reader.string());
                    break;
                case 4:
                    message.weights.push(Decimal.fromAtomics(reader.string(), 18).toString());
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
            allocator: isSet(object.allocator) ? String(object.allocator) : '',
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            users: Array.isArray(object?.users)
                ? object.users.map((e) => String(e))
                : [],
            weights: Array.isArray(object?.weights)
                ? object.weights.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.allocator !== undefined && (obj.allocator = message.allocator);
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        if (message.users) {
            obj.users = message.users.map(e => e);
        }
        else {
            obj.users = [];
        }
        if (message.weights) {
            obj.weights = message.weights.map(e => e);
        }
        else {
            obj.weights = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgSetAirdropAllocations();
        message.allocator = object.allocator ?? '';
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.users = object.users?.map(e => e) || [];
        message.weights = object.weights?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetAirdropAllocations.decode(message.value);
    },
    toProto(message) {
        return MsgSetAirdropAllocations.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgSetAirdropAllocations',
            value: MsgSetAirdropAllocations.encode(message).finish(),
        };
    },
};
function createBaseMsgSetAirdropAllocationsResponse() {
    return {};
}
export const MsgSetAirdropAllocationsResponse = {
    typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgSetAirdropAllocationsResponse();
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
        const message = createBaseMsgSetAirdropAllocationsResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgSetAirdropAllocationsResponse.decode(message.value);
    },
    toProto(message) {
        return MsgSetAirdropAllocationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgSetAirdropAllocationsResponse',
            value: MsgSetAirdropAllocationsResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimFreeAmount() {
    return {
        user: '',
    };
}
export const MsgClaimFreeAmount = {
    typeUrl: '/stride.claim.MsgClaimFreeAmount',
    encode(message, writer = BinaryWriter.create()) {
        if (message.user !== '') {
            writer.uint32(10).string(message.user);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimFreeAmount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.user = reader.string();
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
            user: isSet(object.user) ? String(object.user) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.user !== undefined && (obj.user = message.user);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClaimFreeAmount();
        message.user = object.user ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimFreeAmount.decode(message.value);
    },
    toProto(message) {
        return MsgClaimFreeAmount.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgClaimFreeAmount',
            value: MsgClaimFreeAmount.encode(message).finish(),
        };
    },
};
function createBaseMsgClaimFreeAmountResponse() {
    return {
        claimedAmount: [],
    };
}
export const MsgClaimFreeAmountResponse = {
    typeUrl: '/stride.claim.MsgClaimFreeAmountResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.claimedAmount) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgClaimFreeAmountResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 3:
                    message.claimedAmount.push(Coin.decode(reader, reader.uint32()));
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
            claimedAmount: Array.isArray(object?.claimedAmount)
                ? object.claimedAmount.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.claimedAmount) {
            obj.claimedAmount = message.claimedAmount.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.claimedAmount = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgClaimFreeAmountResponse();
        message.claimedAmount =
            object.claimedAmount?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return MsgClaimFreeAmountResponse.decode(message.value);
    },
    toProto(message) {
        return MsgClaimFreeAmountResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgClaimFreeAmountResponse',
            value: MsgClaimFreeAmountResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateAirdrop() {
    return {
        distributor: '',
        identifier: '',
        chainId: '',
        denom: '',
        startTime: BigInt(0),
        duration: BigInt(0),
        autopilotEnabled: false,
    };
}
export const MsgCreateAirdrop = {
    typeUrl: '/stride.claim.MsgCreateAirdrop',
    encode(message, writer = BinaryWriter.create()) {
        if (message.distributor !== '') {
            writer.uint32(10).string(message.distributor);
        }
        if (message.identifier !== '') {
            writer.uint32(18).string(message.identifier);
        }
        if (message.chainId !== '') {
            writer.uint32(50).string(message.chainId);
        }
        if (message.denom !== '') {
            writer.uint32(42).string(message.denom);
        }
        if (message.startTime !== BigInt(0)) {
            writer.uint32(24).uint64(message.startTime);
        }
        if (message.duration !== BigInt(0)) {
            writer.uint32(32).uint64(message.duration);
        }
        if (message.autopilotEnabled === true) {
            writer.uint32(56).bool(message.autopilotEnabled);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateAirdrop();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.distributor = reader.string();
                    break;
                case 2:
                    message.identifier = reader.string();
                    break;
                case 6:
                    message.chainId = reader.string();
                    break;
                case 5:
                    message.denom = reader.string();
                    break;
                case 3:
                    message.startTime = reader.uint64();
                    break;
                case 4:
                    message.duration = reader.uint64();
                    break;
                case 7:
                    message.autopilotEnabled = reader.bool();
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
            distributor: isSet(object.distributor) ? String(object.distributor) : '',
            identifier: isSet(object.identifier) ? String(object.identifier) : '',
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            denom: isSet(object.denom) ? String(object.denom) : '',
            startTime: isSet(object.startTime)
                ? BigInt(object.startTime.toString())
                : BigInt(0),
            duration: isSet(object.duration)
                ? BigInt(object.duration.toString())
                : BigInt(0),
            autopilotEnabled: isSet(object.autopilotEnabled)
                ? Boolean(object.autopilotEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.distributor !== undefined &&
            (obj.distributor = message.distributor);
        message.identifier !== undefined && (obj.identifier = message.identifier);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.denom !== undefined && (obj.denom = message.denom);
        message.startTime !== undefined &&
            (obj.startTime = (message.startTime || BigInt(0)).toString());
        message.duration !== undefined &&
            (obj.duration = (message.duration || BigInt(0)).toString());
        message.autopilotEnabled !== undefined &&
            (obj.autopilotEnabled = message.autopilotEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateAirdrop();
        message.distributor = object.distributor ?? '';
        message.identifier = object.identifier ?? '';
        message.chainId = object.chainId ?? '';
        message.denom = object.denom ?? '';
        message.startTime =
            object.startTime !== undefined && object.startTime !== null
                ? BigInt(object.startTime.toString())
                : BigInt(0);
        message.duration =
            object.duration !== undefined && object.duration !== null
                ? BigInt(object.duration.toString())
                : BigInt(0);
        message.autopilotEnabled = object.autopilotEnabled ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateAirdrop.decode(message.value);
    },
    toProto(message) {
        return MsgCreateAirdrop.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgCreateAirdrop',
            value: MsgCreateAirdrop.encode(message).finish(),
        };
    },
};
function createBaseMsgCreateAirdropResponse() {
    return {};
}
export const MsgCreateAirdropResponse = {
    typeUrl: '/stride.claim.MsgCreateAirdropResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateAirdropResponse();
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
        const message = createBaseMsgCreateAirdropResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgCreateAirdropResponse.decode(message.value);
    },
    toProto(message) {
        return MsgCreateAirdropResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgCreateAirdropResponse',
            value: MsgCreateAirdropResponse.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteAirdrop() {
    return {
        distributor: '',
        identifier: '',
    };
}
export const MsgDeleteAirdrop = {
    typeUrl: '/stride.claim.MsgDeleteAirdrop',
    encode(message, writer = BinaryWriter.create()) {
        if (message.distributor !== '') {
            writer.uint32(10).string(message.distributor);
        }
        if (message.identifier !== '') {
            writer.uint32(18).string(message.identifier);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteAirdrop();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.distributor = reader.string();
                    break;
                case 2:
                    message.identifier = reader.string();
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
            distributor: isSet(object.distributor) ? String(object.distributor) : '',
            identifier: isSet(object.identifier) ? String(object.identifier) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.distributor !== undefined &&
            (obj.distributor = message.distributor);
        message.identifier !== undefined && (obj.identifier = message.identifier);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseMsgDeleteAirdrop();
        message.distributor = object.distributor ?? '';
        message.identifier = object.identifier ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteAirdrop.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteAirdrop.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgDeleteAirdrop',
            value: MsgDeleteAirdrop.encode(message).finish(),
        };
    },
};
function createBaseMsgDeleteAirdropResponse() {
    return {};
}
export const MsgDeleteAirdropResponse = {
    typeUrl: '/stride.claim.MsgDeleteAirdropResponse',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDeleteAirdropResponse();
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
        const message = createBaseMsgDeleteAirdropResponse();
        return message;
    },
    fromProtoMsg(message) {
        return MsgDeleteAirdropResponse.decode(message.value);
    },
    toProto(message) {
        return MsgDeleteAirdropResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.MsgDeleteAirdropResponse',
            value: MsgDeleteAirdropResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=tx.js.map