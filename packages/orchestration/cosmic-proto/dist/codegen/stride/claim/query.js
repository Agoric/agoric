//@ts-nocheck
import { Action, ClaimRecord, actionFromJSON, actionToJSON, } from './claim.js';
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { Coin } from '../../cosmos/base/v1beta1/coin.js';
import { Params } from './params.js';
import { Period } from '../vesting/vesting.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseClaimStatus() {
    return {
        airdropIdentifier: '',
        claimed: false,
    };
}
export const ClaimStatus = {
    typeUrl: '/stride.claim.ClaimStatus',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.claimed === true) {
            writer.uint32(16).bool(message.claimed);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClaimStatus();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 2:
                    message.claimed = reader.bool();
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            claimed: isSet(object.claimed) ? Boolean(object.claimed) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.claimed !== undefined && (obj.claimed = message.claimed);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClaimStatus();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.claimed = object.claimed ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return ClaimStatus.decode(message.value);
    },
    toProto(message) {
        return ClaimStatus.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.ClaimStatus',
            value: ClaimStatus.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimStatusRequest() {
    return {
        address: '',
    };
}
export const QueryClaimStatusRequest = {
    typeUrl: '/stride.claim.QueryClaimStatusRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimStatusRequest();
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
        const message = createBaseQueryClaimStatusRequest();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimStatusRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClaimStatusRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimStatusRequest',
            value: QueryClaimStatusRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimStatusResponse() {
    return {
        claimStatus: [],
    };
}
export const QueryClaimStatusResponse = {
    typeUrl: '/stride.claim.QueryClaimStatusResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.claimStatus) {
            ClaimStatus.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimStatusResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimStatus.push(ClaimStatus.decode(reader, reader.uint32()));
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
            claimStatus: Array.isArray(object?.claimStatus)
                ? object.claimStatus.map((e) => ClaimStatus.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.claimStatus) {
            obj.claimStatus = message.claimStatus.map(e => e ? ClaimStatus.toJSON(e) : undefined);
        }
        else {
            obj.claimStatus = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimStatusResponse();
        message.claimStatus =
            object.claimStatus?.map(e => ClaimStatus.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimStatusResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClaimStatusResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimStatusResponse',
            value: QueryClaimStatusResponse.encode(message).finish(),
        };
    },
};
function createBaseClaimMetadata() {
    return {
        airdropIdentifier: '',
        currentRound: '',
        currentRoundStart: Timestamp.fromPartial({}),
        currentRoundEnd: Timestamp.fromPartial({}),
    };
}
export const ClaimMetadata = {
    typeUrl: '/stride.claim.ClaimMetadata',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.currentRound !== '') {
            writer.uint32(18).string(message.currentRound);
        }
        if (message.currentRoundStart !== undefined) {
            Timestamp.encode(message.currentRoundStart, writer.uint32(26).fork()).ldelim();
        }
        if (message.currentRoundEnd !== undefined) {
            Timestamp.encode(message.currentRoundEnd, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClaimMetadata();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 2:
                    message.currentRound = reader.string();
                    break;
                case 3:
                    message.currentRoundStart = Timestamp.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.currentRoundEnd = Timestamp.decode(reader, reader.uint32());
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            currentRound: isSet(object.currentRound)
                ? String(object.currentRound)
                : '',
            currentRoundStart: isSet(object.currentRoundStart)
                ? fromJsonTimestamp(object.currentRoundStart)
                : undefined,
            currentRoundEnd: isSet(object.currentRoundEnd)
                ? fromJsonTimestamp(object.currentRoundEnd)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.currentRound !== undefined &&
            (obj.currentRound = message.currentRound);
        message.currentRoundStart !== undefined &&
            (obj.currentRoundStart = fromTimestamp(message.currentRoundStart).toISOString());
        message.currentRoundEnd !== undefined &&
            (obj.currentRoundEnd = fromTimestamp(message.currentRoundEnd).toISOString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseClaimMetadata();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.currentRound = object.currentRound ?? '';
        message.currentRoundStart =
            object.currentRoundStart !== undefined &&
                object.currentRoundStart !== null
                ? Timestamp.fromPartial(object.currentRoundStart)
                : undefined;
        message.currentRoundEnd =
            object.currentRoundEnd !== undefined && object.currentRoundEnd !== null
                ? Timestamp.fromPartial(object.currentRoundEnd)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return ClaimMetadata.decode(message.value);
    },
    toProto(message) {
        return ClaimMetadata.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.ClaimMetadata',
            value: ClaimMetadata.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimMetadataRequest() {
    return {};
}
export const QueryClaimMetadataRequest = {
    typeUrl: '/stride.claim.QueryClaimMetadataRequest',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimMetadataRequest();
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
        const message = createBaseQueryClaimMetadataRequest();
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimMetadataRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClaimMetadataRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimMetadataRequest',
            value: QueryClaimMetadataRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimMetadataResponse() {
    return {
        claimMetadata: [],
    };
}
export const QueryClaimMetadataResponse = {
    typeUrl: '/stride.claim.QueryClaimMetadataResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.claimMetadata) {
            ClaimMetadata.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimMetadataResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimMetadata.push(ClaimMetadata.decode(reader, reader.uint32()));
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
            claimMetadata: Array.isArray(object?.claimMetadata)
                ? object.claimMetadata.map((e) => ClaimMetadata.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.claimMetadata) {
            obj.claimMetadata = message.claimMetadata.map(e => e ? ClaimMetadata.toJSON(e) : undefined);
        }
        else {
            obj.claimMetadata = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimMetadataResponse();
        message.claimMetadata =
            object.claimMetadata?.map(e => ClaimMetadata.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimMetadataResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClaimMetadataResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimMetadataResponse',
            value: QueryClaimMetadataResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryDistributorAccountBalanceRequest() {
    return {
        airdropIdentifier: '',
    };
}
export const QueryDistributorAccountBalanceRequest = {
    typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDistributorAccountBalanceRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDistributorAccountBalanceRequest();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryDistributorAccountBalanceRequest.decode(message.value);
    },
    toProto(message) {
        return QueryDistributorAccountBalanceRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryDistributorAccountBalanceRequest',
            value: QueryDistributorAccountBalanceRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryDistributorAccountBalanceResponse() {
    return {
        distributorAccountBalance: [],
    };
}
export const QueryDistributorAccountBalanceResponse = {
    typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.distributorAccountBalance) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryDistributorAccountBalanceResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.distributorAccountBalance.push(Coin.decode(reader, reader.uint32()));
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
            distributorAccountBalance: Array.isArray(object?.distributorAccountBalance)
                ? object.distributorAccountBalance.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.distributorAccountBalance) {
            obj.distributorAccountBalance = message.distributorAccountBalance.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.distributorAccountBalance = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryDistributorAccountBalanceResponse();
        message.distributorAccountBalance =
            object.distributorAccountBalance?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryDistributorAccountBalanceResponse.decode(message.value);
    },
    toProto(message) {
        return QueryDistributorAccountBalanceResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryDistributorAccountBalanceResponse',
            value: QueryDistributorAccountBalanceResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryParamsRequest() {
    return {};
}
export const QueryParamsRequest = {
    typeUrl: '/stride.claim.QueryParamsRequest',
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
            typeUrl: '/stride.claim.QueryParamsRequest',
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
    typeUrl: '/stride.claim.QueryParamsResponse',
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
            typeUrl: '/stride.claim.QueryParamsResponse',
            value: QueryParamsResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimRecordRequest() {
    return {
        airdropIdentifier: '',
        address: '',
    };
}
export const QueryClaimRecordRequest = {
    typeUrl: '/stride.claim.QueryClaimRecordRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimRecordRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 2:
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            address: isSet(object.address) ? String(object.address) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.address !== undefined && (obj.address = message.address);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimRecordRequest();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimRecordRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClaimRecordRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimRecordRequest',
            value: QueryClaimRecordRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimRecordResponse() {
    return {
        claimRecord: ClaimRecord.fromPartial({}),
    };
}
export const QueryClaimRecordResponse = {
    typeUrl: '/stride.claim.QueryClaimRecordResponse',
    encode(message, writer = BinaryWriter.create()) {
        if (message.claimRecord !== undefined) {
            ClaimRecord.encode(message.claimRecord, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimRecordResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.claimRecord = ClaimRecord.decode(reader, reader.uint32());
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
            claimRecord: isSet(object.claimRecord)
                ? ClaimRecord.fromJSON(object.claimRecord)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.claimRecord !== undefined &&
            (obj.claimRecord = message.claimRecord
                ? ClaimRecord.toJSON(message.claimRecord)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimRecordResponse();
        message.claimRecord =
            object.claimRecord !== undefined && object.claimRecord !== null
                ? ClaimRecord.fromPartial(object.claimRecord)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimRecordResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClaimRecordResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimRecordResponse',
            value: QueryClaimRecordResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimableForActionRequest() {
    return {
        airdropIdentifier: '',
        address: '',
        action: 0,
    };
}
export const QueryClaimableForActionRequest = {
    typeUrl: '/stride.claim.QueryClaimableForActionRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        if (message.action !== 0) {
            writer.uint32(24).int32(message.action);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimableForActionRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 2:
                    message.address = reader.string();
                    break;
                case 3:
                    message.action = reader.int32();
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            address: isSet(object.address) ? String(object.address) : '',
            action: isSet(object.action) ? actionFromJSON(object.action) : -1,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.address !== undefined && (obj.address = message.address);
        message.action !== undefined && (obj.action = actionToJSON(message.action));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimableForActionRequest();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.address = object.address ?? '';
        message.action = object.action ?? 0;
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimableForActionRequest.decode(message.value);
    },
    toProto(message) {
        return QueryClaimableForActionRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimableForActionRequest',
            value: QueryClaimableForActionRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryClaimableForActionResponse() {
    return {
        coins: [],
    };
}
export const QueryClaimableForActionResponse = {
    typeUrl: '/stride.claim.QueryClaimableForActionResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.coins) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryClaimableForActionResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.coins.push(Coin.decode(reader, reader.uint32()));
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
            coins: Array.isArray(object?.coins)
                ? object.coins.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.coins) {
            obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.coins = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryClaimableForActionResponse();
        message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryClaimableForActionResponse.decode(message.value);
    },
    toProto(message) {
        return QueryClaimableForActionResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryClaimableForActionResponse',
            value: QueryClaimableForActionResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryTotalClaimableRequest() {
    return {
        airdropIdentifier: '',
        address: '',
        includeClaimed: false,
    };
}
export const QueryTotalClaimableRequest = {
    typeUrl: '/stride.claim.QueryTotalClaimableRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.address !== '') {
            writer.uint32(18).string(message.address);
        }
        if (message.includeClaimed === true) {
            writer.uint32(24).bool(message.includeClaimed);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryTotalClaimableRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 2:
                    message.address = reader.string();
                    break;
                case 3:
                    message.includeClaimed = reader.bool();
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
            airdropIdentifier: isSet(object.airdropIdentifier)
                ? String(object.airdropIdentifier)
                : '',
            address: isSet(object.address) ? String(object.address) : '',
            includeClaimed: isSet(object.includeClaimed)
                ? Boolean(object.includeClaimed)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.address !== undefined && (obj.address = message.address);
        message.includeClaimed !== undefined &&
            (obj.includeClaimed = message.includeClaimed);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryTotalClaimableRequest();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.address = object.address ?? '';
        message.includeClaimed = object.includeClaimed ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return QueryTotalClaimableRequest.decode(message.value);
    },
    toProto(message) {
        return QueryTotalClaimableRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryTotalClaimableRequest',
            value: QueryTotalClaimableRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryTotalClaimableResponse() {
    return {
        coins: [],
    };
}
export const QueryTotalClaimableResponse = {
    typeUrl: '/stride.claim.QueryTotalClaimableResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.coins) {
            Coin.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryTotalClaimableResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.coins.push(Coin.decode(reader, reader.uint32()));
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
            coins: Array.isArray(object?.coins)
                ? object.coins.map((e) => Coin.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.coins) {
            obj.coins = message.coins.map(e => (e ? Coin.toJSON(e) : undefined));
        }
        else {
            obj.coins = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryTotalClaimableResponse();
        message.coins = object.coins?.map(e => Coin.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryTotalClaimableResponse.decode(message.value);
    },
    toProto(message) {
        return QueryTotalClaimableResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryTotalClaimableResponse',
            value: QueryTotalClaimableResponse.encode(message).finish(),
        };
    },
};
function createBaseQueryUserVestingsRequest() {
    return {
        address: '',
    };
}
export const QueryUserVestingsRequest = {
    typeUrl: '/stride.claim.QueryUserVestingsRequest',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserVestingsRequest();
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
        const message = createBaseQueryUserVestingsRequest();
        message.address = object.address ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserVestingsRequest.decode(message.value);
    },
    toProto(message) {
        return QueryUserVestingsRequest.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryUserVestingsRequest',
            value: QueryUserVestingsRequest.encode(message).finish(),
        };
    },
};
function createBaseQueryUserVestingsResponse() {
    return {
        spendableCoins: [],
        periods: [],
    };
}
export const QueryUserVestingsResponse = {
    typeUrl: '/stride.claim.QueryUserVestingsResponse',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.spendableCoins) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.periods) {
            Period.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseQueryUserVestingsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 3:
                    message.spendableCoins.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 1:
                    message.periods.push(Period.decode(reader, reader.uint32()));
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
            spendableCoins: Array.isArray(object?.spendableCoins)
                ? object.spendableCoins.map((e) => Coin.fromJSON(e))
                : [],
            periods: Array.isArray(object?.periods)
                ? object.periods.map((e) => Period.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.spendableCoins) {
            obj.spendableCoins = message.spendableCoins.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.spendableCoins = [];
        }
        if (message.periods) {
            obj.periods = message.periods.map(e => e ? Period.toJSON(e) : undefined);
        }
        else {
            obj.periods = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseQueryUserVestingsResponse();
        message.spendableCoins =
            object.spendableCoins?.map(e => Coin.fromPartial(e)) || [];
        message.periods = object.periods?.map(e => Period.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return QueryUserVestingsResponse.decode(message.value);
    },
    toProto(message) {
        return QueryUserVestingsResponse.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.QueryUserVestingsResponse',
            value: QueryUserVestingsResponse.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=query.js.map