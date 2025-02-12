//@ts-nocheck
import { Timestamp, } from '../../../google/protobuf/timestamp.js';
import { Any } from '../../../google/protobuf/any.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBasePlan() {
    return {
        name: '',
        time: Timestamp.fromPartial({}),
        height: BigInt(0),
        info: '',
        upgradedClientState: undefined,
    };
}
export const Plan = {
    typeUrl: '/cosmos.upgrade.v1beta1.Plan',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.time !== undefined) {
            Timestamp.encode(message.time, writer.uint32(18).fork()).ldelim();
        }
        if (message.height !== BigInt(0)) {
            writer.uint32(24).int64(message.height);
        }
        if (message.info !== '') {
            writer.uint32(34).string(message.info);
        }
        if (message.upgradedClientState !== undefined) {
            Any.encode(message.upgradedClientState, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBasePlan();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.time = Timestamp.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.height = reader.int64();
                    break;
                case 4:
                    message.info = reader.string();
                    break;
                case 5:
                    message.upgradedClientState = Any.decode(reader, reader.uint32());
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
            time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
            info: isSet(object.info) ? String(object.info) : '',
            upgradedClientState: isSet(object.upgradedClientState)
                ? Any.fromJSON(object.upgradedClientState)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.time !== undefined &&
            (obj.time = fromTimestamp(message.time).toISOString());
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        message.info !== undefined && (obj.info = message.info);
        message.upgradedClientState !== undefined &&
            (obj.upgradedClientState = message.upgradedClientState
                ? Any.toJSON(message.upgradedClientState)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBasePlan();
        message.name = object.name ?? '';
        message.time =
            object.time !== undefined && object.time !== null
                ? Timestamp.fromPartial(object.time)
                : undefined;
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        message.info = object.info ?? '';
        message.upgradedClientState =
            object.upgradedClientState !== undefined &&
                object.upgradedClientState !== null
                ? Any.fromPartial(object.upgradedClientState)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return Plan.decode(message.value);
    },
    toProto(message) {
        return Plan.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.Plan',
            value: Plan.encode(message).finish(),
        };
    },
};
function createBaseSoftwareUpgradeProposal() {
    return {
        $typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
        title: '',
        description: '',
        plan: Plan.fromPartial({}),
    };
}
export const SoftwareUpgradeProposal = {
    typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        if (message.plan !== undefined) {
            Plan.encode(message.plan, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSoftwareUpgradeProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
                    break;
                case 3:
                    message.plan = Plan.decode(reader, reader.uint32());
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
            plan: isSet(object.plan) ? Plan.fromJSON(object.plan) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        message.plan !== undefined &&
            (obj.plan = message.plan ? Plan.toJSON(message.plan) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseSoftwareUpgradeProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        message.plan =
            object.plan !== undefined && object.plan !== null
                ? Plan.fromPartial(object.plan)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return SoftwareUpgradeProposal.decode(message.value);
    },
    toProto(message) {
        return SoftwareUpgradeProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
            value: SoftwareUpgradeProposal.encode(message).finish(),
        };
    },
};
function createBaseCancelSoftwareUpgradeProposal() {
    return {
        $typeUrl: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal',
        title: '',
        description: '',
    };
}
export const CancelSoftwareUpgradeProposal = {
    typeUrl: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal',
    encode(message, writer = BinaryWriter.create()) {
        if (message.title !== '') {
            writer.uint32(10).string(message.title);
        }
        if (message.description !== '') {
            writer.uint32(18).string(message.description);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCancelSoftwareUpgradeProposal();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.title = reader.string();
                    break;
                case 2:
                    message.description = reader.string();
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
            title: isSet(object.title) ? String(object.title) : '',
            description: isSet(object.description) ? String(object.description) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.title !== undefined && (obj.title = message.title);
        message.description !== undefined &&
            (obj.description = message.description);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCancelSoftwareUpgradeProposal();
        message.title = object.title ?? '';
        message.description = object.description ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return CancelSoftwareUpgradeProposal.decode(message.value);
    },
    toProto(message) {
        return CancelSoftwareUpgradeProposal.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal',
            value: CancelSoftwareUpgradeProposal.encode(message).finish(),
        };
    },
};
function createBaseModuleVersion() {
    return {
        name: '',
        version: BigInt(0),
    };
}
export const ModuleVersion = {
    typeUrl: '/cosmos.upgrade.v1beta1.ModuleVersion',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.version !== BigInt(0)) {
            writer.uint32(16).uint64(message.version);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseModuleVersion();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.version = reader.uint64();
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
            version: isSet(object.version)
                ? BigInt(object.version.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.version !== undefined &&
            (obj.version = (message.version || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseModuleVersion();
        message.name = object.name ?? '';
        message.version =
            object.version !== undefined && object.version !== null
                ? BigInt(object.version.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return ModuleVersion.decode(message.value);
    },
    toProto(message) {
        return ModuleVersion.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.ModuleVersion',
            value: ModuleVersion.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=upgrade.js.map