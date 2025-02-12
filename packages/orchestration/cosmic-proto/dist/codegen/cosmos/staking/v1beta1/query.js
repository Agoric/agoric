//@ts-nocheck
import { PageRequest, PageResponse, } from '../../base/query/v1beta1/pagination.js';
import { Validator, DelegationResponse, UnbondingDelegation, RedelegationResponse, HistoricalInfo, Pool, Params, } from './staking.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseQueryValidatorsRequest() {
    return {
        status: '',
        pagination: undefined,
    };
}
export const QueryValidatorsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.status !== '') {
            writer.uint32(10).string(message.status);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.status = reader.string();
                    break;
                case 2:
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
            status: isSet(object.status) ? String(object.status) : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.status !== undefined && (obj.status = message.status);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorsRequest();
        message.status = object.status ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsRequest',
            value: QueryValidatorsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorsResponse() {
    return {
        validators: [],
        pagination: undefined,
    };
}
export const QueryValidatorsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
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
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorsResponse();
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorsResponse',
            value: QueryValidatorsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorRequest() {
    return {
        validatorAddr: '',
    };
}
export const QueryValidatorRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddr !== '') {
            writer.uint32(10).string(message.validatorAddr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddr = reader.string();
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
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorRequest();
        message.validatorAddr = object.validatorAddr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorRequest.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorRequest',
            value: QueryValidatorRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorResponse() {
    return {
        validator: Validator.fromPartial({}),
    };
}
export const QueryValidatorResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validator !== undefined) {
            Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validator = Validator.decode(reader, reader.uint32());
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
            validator: isSet(object.validator)
                ? Validator.fromJSON(object.validator)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? Validator.toJSON(message.validator)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorResponse();
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? Validator.fromPartial(object.validator)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorResponse.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorResponse',
            value: QueryValidatorResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorDelegationsRequest() {
    return {
        validatorAddr: '',
        pagination: undefined,
    };
}
export const QueryValidatorDelegationsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddr !== '') {
            writer.uint32(10).string(message.validatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorDelegationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddr = reader.string();
                    break;
                case 2:
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
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorDelegationsRequest();
        message.validatorAddr = object.validatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorDelegationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorDelegationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsRequest',
            value: QueryValidatorDelegationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorDelegationsResponse() {
    return {
        delegationResponses: [],
        pagination: undefined,
    };
}
export const QueryValidatorDelegationsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.delegationResponses) {
            DelegationResponse.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorDelegationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegationResponses.push(DelegationResponse.decode(reader, reader.uint32()));
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
            delegationResponses: Array.isArray(object?.delegationResponses)
                ? object.delegationResponses.map((e) => DelegationResponse.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.delegationResponses) {
            obj.delegationResponses = message.delegationResponses.map(e => e ? DelegationResponse.toJSON(e) : undefined);
        }
        else {
            obj.delegationResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorDelegationsResponse();
        message.delegationResponses =
            object.delegationResponses?.map(e => DelegationResponse.fromPartial(e)) ||
                [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorDelegationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorDelegationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorDelegationsResponse',
            value: QueryValidatorDelegationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorUnbondingDelegationsRequest() {
    return {
        validatorAddr: '',
        pagination: undefined,
    };
}
export const QueryValidatorUnbondingDelegationsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validatorAddr !== '') {
            writer.uint32(10).string(message.validatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorUnbondingDelegationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validatorAddr = reader.string();
                    break;
                case 2:
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
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorUnbondingDelegationsRequest();
        message.validatorAddr = object.validatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorUnbondingDelegationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorUnbondingDelegationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsRequest',
            value: QueryValidatorUnbondingDelegationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryValidatorUnbondingDelegationsResponse() {
    return {
        unbondingResponses: [],
        pagination: undefined,
    };
}
export const QueryValidatorUnbondingDelegationsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.unbondingResponses) {
            UnbondingDelegation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryValidatorUnbondingDelegationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbondingResponses.push(UnbondingDelegation.decode(reader, reader.uint32()));
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
            unbondingResponses: Array.isArray(object?.unbondingResponses)
                ? object.unbondingResponses.map((e) => UnbondingDelegation.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unbondingResponses) {
            obj.unbondingResponses = message.unbondingResponses.map(e => e ? UnbondingDelegation.toJSON(e) : undefined);
        }
        else {
            obj.unbondingResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryValidatorUnbondingDelegationsResponse();
        message.unbondingResponses =
            object.unbondingResponses?.map(e => UnbondingDelegation.fromPartial(e)) ||
                [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryValidatorUnbondingDelegationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryValidatorUnbondingDelegationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryValidatorUnbondingDelegationsResponse',
            value: QueryValidatorUnbondingDelegationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegationRequest() {
    return {
        delegatorAddr: '',
        validatorAddr: '',
    };
}
export const QueryDelegationRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegationRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.validatorAddr !== '') {
            writer.uint32(18).string(message.validatorAddr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegationRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
                    message.validatorAddr = reader.string();
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegationRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.validatorAddr = object.validatorAddr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegationRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegationRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegationRequest',
            value: QueryDelegationRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegationResponse() {
    return {
        delegationResponse: undefined,
    };
}
export const QueryDelegationResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegationResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegationResponse !== undefined) {
            DelegationResponse.encode(message.delegationResponse, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegationResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegationResponse = DelegationResponse.decode(reader, reader.uint32());
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
            delegationResponse: isSet(object.delegationResponse)
                ? DelegationResponse.fromJSON(object.delegationResponse)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegationResponse !== undefined &&
            (obj.delegationResponse = message.delegationResponse
                ? DelegationResponse.toJSON(message.delegationResponse)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegationResponse();
        message.delegationResponse =
            object.delegationResponse !== undefined &&
                object.delegationResponse !== null
                ? DelegationResponse.fromPartial(object.delegationResponse)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegationResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegationResponse',
            value: QueryDelegationResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUnbondingDelegationRequest() {
    return {
        delegatorAddr: '',
        validatorAddr: '',
    };
}
export const QueryUnbondingDelegationRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.validatorAddr !== '') {
            writer.uint32(18).string(message.validatorAddr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUnbondingDelegationRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
                    message.validatorAddr = reader.string();
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUnbondingDelegationRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.validatorAddr = object.validatorAddr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUnbondingDelegationRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUnbondingDelegationRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationRequest',
            value: QueryUnbondingDelegationRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUnbondingDelegationResponse() {
    return {
        unbond: UnbondingDelegation.fromPartial({}),
    };
}
export const QueryUnbondingDelegationResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.unbond !== undefined) {
            UnbondingDelegation.encode(message.unbond, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUnbondingDelegationResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbond = UnbondingDelegation.decode(reader, reader.uint32());
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
            unbond: isSet(object.unbond)
                ? UnbondingDelegation.fromJSON(object.unbond)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.unbond !== undefined &&
            (obj.unbond = message.unbond
                ? UnbondingDelegation.toJSON(message.unbond)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUnbondingDelegationResponse();
        message.unbond =
            object.unbond !== undefined && object.unbond !== null
                ? UnbondingDelegation.fromPartial(object.unbond)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryUnbondingDelegationResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUnbondingDelegationResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryUnbondingDelegationResponse',
            value: QueryUnbondingDelegationResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorDelegationsRequest() {
    return {
        delegatorAddr: '',
        pagination: undefined,
    };
}
export const QueryDelegatorDelegationsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorDelegationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorDelegationsRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorDelegationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorDelegationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsRequest',
            value: QueryDelegatorDelegationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorDelegationsResponse() {
    return {
        delegationResponses: [],
        pagination: undefined,
    };
}
export const QueryDelegatorDelegationsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.delegationResponses) {
            DelegationResponse.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorDelegationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegationResponses.push(DelegationResponse.decode(reader, reader.uint32()));
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
            delegationResponses: Array.isArray(object?.delegationResponses)
                ? object.delegationResponses.map((e) => DelegationResponse.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.delegationResponses) {
            obj.delegationResponses = message.delegationResponses.map(e => e ? DelegationResponse.toJSON(e) : undefined);
        }
        else {
            obj.delegationResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorDelegationsResponse();
        message.delegationResponses =
            object.delegationResponses?.map(e => DelegationResponse.fromPartial(e)) ||
                [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorDelegationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorDelegationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorDelegationsResponse',
            value: QueryDelegatorDelegationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorUnbondingDelegationsRequest() {
    return {
        delegatorAddr: '',
        pagination: undefined,
    };
}
export const QueryDelegatorUnbondingDelegationsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorUnbondingDelegationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorUnbondingDelegationsRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorUnbondingDelegationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorUnbondingDelegationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsRequest',
            value: QueryDelegatorUnbondingDelegationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorUnbondingDelegationsResponse() {
    return {
        unbondingResponses: [],
        pagination: undefined,
    };
}
export const QueryDelegatorUnbondingDelegationsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.unbondingResponses) {
            UnbondingDelegation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorUnbondingDelegationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.unbondingResponses.push(UnbondingDelegation.decode(reader, reader.uint32()));
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
            unbondingResponses: Array.isArray(object?.unbondingResponses)
                ? object.unbondingResponses.map((e) => UnbondingDelegation.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.unbondingResponses) {
            obj.unbondingResponses = message.unbondingResponses.map(e => e ? UnbondingDelegation.toJSON(e) : undefined);
        }
        else {
            obj.unbondingResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorUnbondingDelegationsResponse();
        message.unbondingResponses =
            object.unbondingResponses?.map(e => UnbondingDelegation.fromPartial(e)) ||
                [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorUnbondingDelegationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorUnbondingDelegationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorUnbondingDelegationsResponse',
            value: QueryDelegatorUnbondingDelegationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryRedelegationsRequest() {
    return {
        delegatorAddr: '',
        srcValidatorAddr: '',
        dstValidatorAddr: '',
        pagination: undefined,
    };
}
export const QueryRedelegationsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.srcValidatorAddr !== '') {
            writer.uint32(18).string(message.srcValidatorAddr);
        }
        if (message.dstValidatorAddr !== '') {
            writer.uint32(26).string(message.dstValidatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedelegationsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
                    message.srcValidatorAddr = reader.string();
                    break;
                case 3:
                    message.dstValidatorAddr = reader.string();
                    break;
                case 4:
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            srcValidatorAddr: isSet(object.srcValidatorAddr)
                ? String(object.srcValidatorAddr)
                : '',
            dstValidatorAddr: isSet(object.dstValidatorAddr)
                ? String(object.dstValidatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.srcValidatorAddr !== undefined &&
            (obj.srcValidatorAddr = message.srcValidatorAddr);
        message.dstValidatorAddr !== undefined &&
            (obj.dstValidatorAddr = message.dstValidatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedelegationsRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.srcValidatorAddr = object.srcValidatorAddr ?? '';
        message.dstValidatorAddr = object.dstValidatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedelegationsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryRedelegationsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsRequest',
            value: QueryRedelegationsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryRedelegationsResponse() {
    return {
        redelegationResponses: [],
        pagination: undefined,
    };
}
export const QueryRedelegationsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.redelegationResponses) {
            RedelegationResponse.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryRedelegationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.redelegationResponses.push(RedelegationResponse.decode(reader, reader.uint32()));
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
            redelegationResponses: Array.isArray(object?.redelegationResponses)
                ? object.redelegationResponses.map((e) => RedelegationResponse.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.redelegationResponses) {
            obj.redelegationResponses = message.redelegationResponses.map(e => e ? RedelegationResponse.toJSON(e) : undefined);
        }
        else {
            obj.redelegationResponses = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryRedelegationsResponse();
        message.redelegationResponses =
            object.redelegationResponses?.map(e => RedelegationResponse.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryRedelegationsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryRedelegationsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryRedelegationsResponse',
            value: QueryRedelegationsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorValidatorsRequest() {
    return {
        delegatorAddr: '',
        pagination: undefined,
    };
}
export const QueryDelegatorValidatorsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.pagination !== undefined) {
            PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorValidatorsRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            pagination: isSet(object.pagination)
                ? PageRequest.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageRequest.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorValidatorsRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageRequest.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorValidatorsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorValidatorsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsRequest',
            value: QueryDelegatorValidatorsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorValidatorsResponse() {
    return {
        validators: [],
        pagination: undefined,
    };
}
export const QueryDelegatorValidatorsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(10).fork()).ldelim();
        }
        if (message.pagination !== undefined) {
            PageResponse.encode(message.pagination, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorValidatorsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
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
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
            pagination: isSet(object.pagination)
                ? PageResponse.fromJSON(object.pagination)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.pagination !== undefined &&
            (obj.pagination = message.pagination
                ? PageResponse.toJSON(message.pagination)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorValidatorsResponse();
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        message.pagination =
            object.pagination !== undefined && object.pagination !== null
                ? PageResponse.fromPartial(object.pagination)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorValidatorsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorValidatorsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorsResponse',
            value: QueryDelegatorValidatorsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorValidatorRequest() {
    return {
        delegatorAddr: '',
        validatorAddr: '',
    };
}
export const QueryDelegatorValidatorRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.delegatorAddr !== '') {
            writer.uint32(10).string(message.delegatorAddr);
        }
        if (message.validatorAddr !== '') {
            writer.uint32(18).string(message.validatorAddr);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorValidatorRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.delegatorAddr = reader.string();
                    break;
                case 2:
                    message.validatorAddr = reader.string();
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
            delegatorAddr: isSet(object.delegatorAddr)
                ? String(object.delegatorAddr)
                : '',
            validatorAddr: isSet(object.validatorAddr)
                ? String(object.validatorAddr)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.delegatorAddr !== undefined &&
            (obj.delegatorAddr = message.delegatorAddr);
        message.validatorAddr !== undefined &&
            (obj.validatorAddr = message.validatorAddr);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorValidatorRequest();
        message.delegatorAddr = object.delegatorAddr ?? '';
        message.validatorAddr = object.validatorAddr ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorValidatorRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorValidatorRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorRequest',
            value: QueryDelegatorValidatorRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDelegatorValidatorResponse() {
    return {
        validator: Validator.fromPartial({}),
    };
}
export const QueryDelegatorValidatorResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.validator !== undefined) {
            Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDelegatorValidatorResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.validator = Validator.decode(reader, reader.uint32());
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
            validator: isSet(object.validator)
                ? Validator.fromJSON(object.validator)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.validator !== undefined &&
            (obj.validator = message.validator
                ? Validator.toJSON(message.validator)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDelegatorValidatorResponse();
        message.validator =
            object.validator !== undefined && object.validator !== null
                ? Validator.fromPartial(object.validator)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryDelegatorValidatorResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDelegatorValidatorResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryDelegatorValidatorResponse',
            value: QueryDelegatorValidatorResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryHistoricalInfoRequest() {
    return {
        height: BigInt(0),
    };
}
export const QueryHistoricalInfoRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.height !== BigInt(0)) {
            writer.uint32(8).int64(message.height);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryHistoricalInfoRequest();
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
        const message = createBaseQueryHistoricalInfoRequest();
        message.height =
            object.height !== undefined && object.height !== null
                ? BigInt(object.height.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return QueryHistoricalInfoRequest.decode(message.value);
    },
    toProto(message) {
        return QueryHistoricalInfoRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoRequest',
            value: QueryHistoricalInfoRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryHistoricalInfoResponse() {
    return {
        hist: undefined,
    };
}
export const QueryHistoricalInfoResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.hist !== undefined) {
            HistoricalInfo.encode(message.hist, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryHistoricalInfoResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hist = HistoricalInfo.decode(reader, reader.uint32());
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
            hist: isSet(object.hist)
                ? HistoricalInfo.fromJSON(object.hist)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.hist !== undefined &&
            (obj.hist = message.hist
                ? HistoricalInfo.toJSON(message.hist)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryHistoricalInfoResponse();
        message.hist =
            object.hist !== undefined && object.hist !== null
                ? HistoricalInfo.fromPartial(object.hist)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryHistoricalInfoResponse.decode(message.value);
    },
    toProto(message) {
        return QueryHistoricalInfoResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryHistoricalInfoResponse',
            value: QueryHistoricalInfoResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryPoolRequest() {
    return {};
}
export const QueryPoolRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryPoolRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryPoolRequest();
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
        const message = createBaseQueryPoolRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryPoolRequest.decode(message.value);
    },
    toProto(message) {
        return QueryPoolRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryPoolRequest',
            value: QueryPoolRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryPoolResponse() {
    return {
        pool: Pool.fromPartial({}),
    };
}
export const QueryPoolResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryPoolResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.pool !== undefined) {
            Pool.encode(message.pool, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryPoolResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.pool = Pool.decode(reader, reader.uint32());
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
            pool: isSet(object.pool) ? Pool.fromJSON(object.pool) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.pool !== undefined &&
            (obj.pool = message.pool ? Pool.toJSON(message.pool) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryPoolResponse();
        message.pool =
            object.pool !== undefined && object.pool !== null
                ? Pool.fromPartial(object.pool)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryPoolResponse.decode(message.value);
    },
    toProto(message) {
        return QueryPoolResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryPoolResponse',
            value: QueryPoolResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/cosmos.staking.v1beta1.QueryParamsRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryParamsRequest();
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
        const message = createBaseQueryParamsRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryParamsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryParamsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryParamsRequest',
            value: QueryParamsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsResponse() {
    return {
        params: Params.fromPartial({}),
    };
}
export const QueryParamsResponse = {
    typeUrl: '/cosmos.staking.v1beta1.QueryParamsResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryParamsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = Params.decode(reader, reader.uint32());
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
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryParamsResponse();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryParamsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryParamsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/cosmos.staking.v1beta1.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map