//@ts-nocheck
import { Plan, ModuleVersion, } from './upgrade.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import {} from '../../../json-safe.js';
import { isSet, bytesFromBase64, base64FromBytes } from '../../../helpers.js';
function createBaseQueryCurrentPlanRequest() {
    return {};
}
export const QueryCurrentPlanRequest = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCurrentPlanRequest();
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
        const message = createBaseQueryCurrentPlanRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryCurrentPlanRequest.decode(message.value);
    },
    toProto(message) {
        return QueryCurrentPlanRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanRequest',
            value: QueryCurrentPlanRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryCurrentPlanResponse() {
    return {
        plan: undefined,
    };
}
export const QueryCurrentPlanResponse = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.plan !== undefined) {
            Plan.encode(message.plan, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCurrentPlanResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
            plan: isSet(object.plan) ? Plan.fromJSON(object.plan) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.plan !== undefined &&
            (obj.plan = message.plan ? Plan.toJSON(message.plan) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryCurrentPlanResponse();
        message.plan =
            object.plan !== undefined && object.plan !== null
                ? Plan.fromPartial(object.plan)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryCurrentPlanResponse.decode(message.value);
    },
    toProto(message) {
        return QueryCurrentPlanResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryCurrentPlanResponse',
            value: QueryCurrentPlanResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAppliedPlanRequest() {
    return {
        name: '',
    };
}
export const QueryAppliedPlanRequest = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAppliedPlanRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAppliedPlanRequest();
        message.name = object.name ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAppliedPlanRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAppliedPlanRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanRequest',
            value: QueryAppliedPlanRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAppliedPlanResponse() {
    return {
        height: BigInt(0),
    };
}
export const QueryAppliedPlanResponse = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAppliedPlanResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
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
            height: isSet(object.height)
                ? BigInt(object.height.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.height !== undefined &&
            (obj.height = (message.height || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAppliedPlanResponse();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryAppliedPlanResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAppliedPlanResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryAppliedPlanResponse',
            value: QueryAppliedPlanResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedConsensusStateRequest() {
    return {
        lastHeight: BigInt(0),
    };
}
export const QueryUpgradedConsensusStateRequest = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.lastHeight !== BigInt(0)) {
            writer.uint32(8).int64(message.lastHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedConsensusStateRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.lastHeight = reader.int64();
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
            lastHeight: isSet(object.lastHeight)
                ? BigInt(object.lastHeight.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.lastHeight !== undefined &&
            (obj.lastHeight = (message.lastHeight || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUpgradedConsensusStateRequest();
        message.lastHeight =
            object.lastHeight !== undefined && object.lastHeight !== null
                ? BigInt(object.lastHeight.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedConsensusStateRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedConsensusStateRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateRequest',
            value: QueryUpgradedConsensusStateRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUpgradedConsensusStateResponse() {
    return {
        upgradedConsensusState: new Uint8Array(),
    };
}
export const QueryUpgradedConsensusStateResponse = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.upgradedConsensusState.length !== 0) {
            writer.uint32(18).bytes(message.upgradedConsensusState);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUpgradedConsensusStateResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.upgradedConsensusState = reader.bytes();
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
            upgradedConsensusState: isSet(object.upgradedConsensusState)
                ? bytesFromBase64(object.upgradedConsensusState)
                : new Uint8Array(),
        };
    },
    toJSON(message) {
        const obj = {};
        message.upgradedConsensusState !== undefined &&
            (obj.upgradedConsensusState = base64FromBytes(message.upgradedConsensusState !== undefined
                ? message.upgradedConsensusState
                : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUpgradedConsensusStateResponse();
        message.upgradedConsensusState =
            object.upgradedConsensusState ?? new Uint8Array();
        return message;
    },
    fromProtoMsg(message) {
        return QueryUpgradedConsensusStateResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUpgradedConsensusStateResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryUpgradedConsensusStateResponse',
            value: QueryUpgradedConsensusStateResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleVersionsRequest() {
    return {
        moduleName: '',
    };
}
export const QueryModuleVersionsRequest = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.moduleName !== '') {
            writer.uint32(10).string(message.moduleName);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleVersionsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.moduleName = reader.string();
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
            moduleName: isSet(object.moduleName) ? String(object.moduleName) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.moduleName !== undefined && (obj.moduleName = message.moduleName);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleVersionsRequest();
        message.moduleName = object.moduleName ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleVersionsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryModuleVersionsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsRequest',
            value: QueryModuleVersionsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryModuleVersionsResponse() {
    return {
        moduleVersions: [],
    };
}
export const QueryModuleVersionsResponse = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.moduleVersions) {
            ModuleVersion.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryModuleVersionsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.moduleVersions.push(ModuleVersion.decode(reader, reader.uint32()));
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
            moduleVersions: Array.isArray(object?.moduleVersions)
                ? object.moduleVersions.map((e) => ModuleVersion.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.moduleVersions) {
            obj.moduleVersions = message.moduleVersions.map(e => e ? ModuleVersion.toJSON(e) : undefined);
        }
        else {
            obj.moduleVersions = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryModuleVersionsResponse();
        message.moduleVersions =
            object.moduleVersions?.map(e => ModuleVersion.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryModuleVersionsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryModuleVersionsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryModuleVersionsResponse',
            value: QueryModuleVersionsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryAuthorityRequest() {
    return {};
}
export const QueryAuthorityRequest = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAuthorityRequest();
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
        const message = createBaseQueryAuthorityRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryAuthorityRequest.decode(message.value);
    },
    toProto(message) {
        return QueryAuthorityRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityRequest',
            value: QueryAuthorityRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryAuthorityResponse() {
    return {
        address: '',
    };
}
export const QueryAuthorityResponse = {
    typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryAuthorityResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
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
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryAuthorityResponse();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryAuthorityResponse.decode(message.value);
    },
    toProto(message) {
        return QueryAuthorityResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.upgrade.v1beta1.QueryAuthorityResponse',
            value: QueryAuthorityResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map