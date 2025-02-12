//@ts-nocheck
import { PageRequest, PageResponse, } from '../../cosmos/base/query/v1beta1/pagination.js';
import { EpochInfo } from './genesis.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseQueryEpochsInfoRequest() {
    return {
        pagination: undefined,
    };
}
export const QueryEpochsInfoRequest = {
    typeUrl: '/stride.epochs.QueryEpochsInfoRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochsInfoRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pagination = PageRequest.decode(reader, reader.uint32());
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
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEpochsInfoRequest();
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochsInfoRequest.decode(message.value);
    },
    toProto(message) {
        return QueryEpochsInfoRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryEpochsInfoRequest',
            value: QueryEpochsInfoRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryEpochsInfoResponse() {
    return {
        epochs: [],
        pagination: undefined,
    };
}
export const QueryEpochsInfoResponse = {
    typeUrl: '/stride.epochs.QueryEpochsInfoResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.epochs) {
            EpochInfo.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochsInfoResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epochs.push(EpochInfo.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.pagination = PageResponse.decode(reader, reader.uint32());
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
            epochs: Array.isArray(object?.epochs)
                ? object.epochs.map((e) => EpochInfo.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.epochs) {
            obj.epochs = message.epochs.map(e => e ? EpochInfo.toJSON(e) : undefined);
        }
        else {
            obj.epochs = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEpochsInfoResponse();
        message.epochs = object.epochs?.map(e => EpochInfo.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochsInfoResponse.decode(message.value);
    },
    toProto(message) {
        return QueryEpochsInfoResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryEpochsInfoResponse',
            value: QueryEpochsInfoResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryCurrentEpochRequest() {
    return {
        identifier: '',
    };
}
export const QueryCurrentEpochRequest = {
    typeUrl: '/stride.epochs.QueryCurrentEpochRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.identifier !== '') {
            writer.uint32(10).string(message.identifier);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCurrentEpochRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
            identifier: isSet(object.identifier) ? String(object.identifier) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.identifier !== undefined && (obj.identifier = message.identifier);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryCurrentEpochRequest();
        message.identifier = object.identifier ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryCurrentEpochRequest.decode(message.value);
    },
    toProto(message) {
        return QueryCurrentEpochRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryCurrentEpochRequest',
            value: QueryCurrentEpochRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryCurrentEpochResponse() {
    return {
        currentEpoch: BigInt(0),
    };
}
export const QueryCurrentEpochResponse = {
    typeUrl: '/stride.epochs.QueryCurrentEpochResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.currentEpoch !== BigInt(0)) {
            writer.uint32(8).int64(message.currentEpoch);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryCurrentEpochResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.currentEpoch = reader.int64();
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
            currentEpoch: isSet(object.currentEpoch)
                ? BigInt(object.currentEpoch.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.currentEpoch !== undefined &&
            (obj.currentEpoch = (message.currentEpoch || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryCurrentEpochResponse();
        message.currentEpoch =
            object.currentEpoch !== undefined && object.currentEpoch !== null
                ? BigInt(object.currentEpoch.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryCurrentEpochResponse.decode(message.value);
    },
    toProto(message) {
        return QueryCurrentEpochResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryCurrentEpochResponse',
            value: QueryCurrentEpochResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryEpochInfoRequest() {
    return {
        identifier: '',
    };
}
export const QueryEpochInfoRequest = {
    typeUrl: '/stride.epochs.QueryEpochInfoRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.identifier !== '') {
            writer.uint32(10).string(message.identifier);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochInfoRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
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
            identifier: isSet(object.identifier) ? String(object.identifier) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.identifier !== undefined && (obj.identifier = message.identifier);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEpochInfoRequest();
        message.identifier = object.identifier ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochInfoRequest.decode(message.value);
    },
    toProto(message) {
        return QueryEpochInfoRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryEpochInfoRequest',
            value: QueryEpochInfoRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryEpochInfoResponse() {
    return {
        epoch: EpochInfo.fromPartial({}),
    };
}
export const QueryEpochInfoResponse = {
    typeUrl: '/stride.epochs.QueryEpochInfoResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.epoch !== undefined) {
            EpochInfo.encode(message.epoch, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryEpochInfoResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.epoch = EpochInfo.decode(reader, reader.uint32());
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
            epoch: isSet(object.epoch) ? EpochInfo.fromJSON(object.epoch) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.epoch !== undefined &&
            (obj.epoch = message.epoch ? EpochInfo.toJSON(message.epoch) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryEpochInfoResponse();
        message.epoch =
            object.epoch !== undefined && object.epoch !== null
                ? EpochInfo.fromPartial(object.epoch)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryEpochInfoResponse.decode(message.value);
    },
    toProto(message) {
        return QueryEpochInfoResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.epochs.QueryEpochInfoResponse',
            value: QueryEpochInfoResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map