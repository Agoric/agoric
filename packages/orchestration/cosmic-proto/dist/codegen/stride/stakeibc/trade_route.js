//@ts-nocheck
import { ICAAccount } from './ica_account.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseTradeConfig() {
    return {
        poolId: BigInt(0),
        swapPrice: '',
        priceUpdateTimestamp: BigInt(0),
        maxAllowedSwapLossRate: '',
        minSwapAmount: '',
        maxSwapAmount: '',
    };
}
export const TradeConfig = {
    typeUrl: '/stride.stakeibc.TradeConfig',
    encode(message, writer = BinaryWriter.create()) {
        if (message.poolId !== BigInt(0)) {
            writer.uint32(8).uint64(message.poolId);
        }
        if (message.swapPrice !== '') {
            writer
                .uint32(18)
                .string(Decimal.fromUserInput(message.swapPrice, 18).atomics);
        }
        if (message.priceUpdateTimestamp !== BigInt(0)) {
            writer.uint32(24).uint64(message.priceUpdateTimestamp);
        }
        if (message.maxAllowedSwapLossRate !== '') {
            writer
                .uint32(34)
                .string(Decimal.fromUserInput(message.maxAllowedSwapLossRate, 18).atomics);
        }
        if (message.minSwapAmount !== '') {
            writer.uint32(42).string(message.minSwapAmount);
        }
        if (message.maxSwapAmount !== '') {
            writer.uint32(50).string(message.maxSwapAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTradeConfig();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.poolId = reader.uint64();
                    break;
                case 2:
                    message.swapPrice = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 3:
                    message.priceUpdateTimestamp = reader.uint64();
                    break;
                case 4:
                    message.maxAllowedSwapLossRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 5:
                    message.minSwapAmount = reader.string();
                    break;
                case 6:
                    message.maxSwapAmount = reader.string();
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
            poolId: isSet(object.poolId)
                ? BigInt(object.poolId.toString())
                : BigInt(0),
            swapPrice: isSet(object.swapPrice) ? String(object.swapPrice) : '',
            priceUpdateTimestamp: isSet(object.priceUpdateTimestamp)
                ? BigInt(object.priceUpdateTimestamp.toString())
                : BigInt(0),
            maxAllowedSwapLossRate: isSet(object.maxAllowedSwapLossRate)
                ? String(object.maxAllowedSwapLossRate)
                : '',
            minSwapAmount: isSet(object.minSwapAmount)
                ? String(object.minSwapAmount)
                : '',
            maxSwapAmount: isSet(object.maxSwapAmount)
                ? String(object.maxSwapAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.poolId !== undefined &&
            (obj.poolId = (message.poolId || BigInt(0)).toString());
        message.swapPrice !== undefined && (obj.swapPrice = message.swapPrice);
        message.priceUpdateTimestamp !== undefined &&
            (obj.priceUpdateTimestamp = (message.priceUpdateTimestamp || BigInt(0)).toString());
        message.maxAllowedSwapLossRate !== undefined &&
            (obj.maxAllowedSwapLossRate = message.maxAllowedSwapLossRate);
        message.minSwapAmount !== undefined &&
            (obj.minSwapAmount = message.minSwapAmount);
        message.maxSwapAmount !== undefined &&
            (obj.maxSwapAmount = message.maxSwapAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTradeConfig();
        message.poolId =
            object.poolId !== undefined && object.poolId !== null
                ? BigInt(object.poolId.toString())
                : BigInt(0);
        message.swapPrice = object.swapPrice ?? '';
        message.priceUpdateTimestamp =
            object.priceUpdateTimestamp !== undefined &&
                object.priceUpdateTimestamp !== null
                ? BigInt(object.priceUpdateTimestamp.toString())
                : BigInt(0);
        message.maxAllowedSwapLossRate = object.maxAllowedSwapLossRate ?? '';
        message.minSwapAmount = object.minSwapAmount ?? '';
        message.maxSwapAmount = object.maxSwapAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return TradeConfig.decode(message.value);
    },
    toProto(message) {
        return TradeConfig.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.TradeConfig',
            value: TradeConfig.encode(message).finish(),
        };
    },
};
function createBaseTradeRoute() {
    return {
        rewardDenomOnHostZone: '',
        rewardDenomOnRewardZone: '',
        rewardDenomOnTradeZone: '',
        hostDenomOnTradeZone: '',
        hostDenomOnHostZone: '',
        hostAccount: ICAAccount.fromPartial({}),
        rewardAccount: ICAAccount.fromPartial({}),
        tradeAccount: ICAAccount.fromPartial({}),
        hostToRewardChannelId: '',
        rewardToTradeChannelId: '',
        tradeToHostChannelId: '',
        minTransferAmount: '',
        tradeConfig: TradeConfig.fromPartial({}),
    };
}
export const TradeRoute = {
    typeUrl: '/stride.stakeibc.TradeRoute',
    encode(message, writer = BinaryWriter.create()) {
        if (message.rewardDenomOnHostZone !== '') {
            writer.uint32(10).string(message.rewardDenomOnHostZone);
        }
        if (message.rewardDenomOnRewardZone !== '') {
            writer.uint32(18).string(message.rewardDenomOnRewardZone);
        }
        if (message.rewardDenomOnTradeZone !== '') {
            writer.uint32(26).string(message.rewardDenomOnTradeZone);
        }
        if (message.hostDenomOnTradeZone !== '') {
            writer.uint32(34).string(message.hostDenomOnTradeZone);
        }
        if (message.hostDenomOnHostZone !== '') {
            writer.uint32(42).string(message.hostDenomOnHostZone);
        }
        if (message.hostAccount !== undefined) {
            ICAAccount.encode(message.hostAccount, writer.uint32(50).fork()).ldelim();
        }
        if (message.rewardAccount !== undefined) {
            ICAAccount.encode(message.rewardAccount, writer.uint32(58).fork()).ldelim();
        }
        if (message.tradeAccount !== undefined) {
            ICAAccount.encode(message.tradeAccount, writer.uint32(66).fork()).ldelim();
        }
        if (message.hostToRewardChannelId !== '') {
            writer.uint32(74).string(message.hostToRewardChannelId);
        }
        if (message.rewardToTradeChannelId !== '') {
            writer.uint32(82).string(message.rewardToTradeChannelId);
        }
        if (message.tradeToHostChannelId !== '') {
            writer.uint32(90).string(message.tradeToHostChannelId);
        }
        if (message.minTransferAmount !== '') {
            writer.uint32(106).string(message.minTransferAmount);
        }
        if (message.tradeConfig !== undefined) {
            TradeConfig.encode(message.tradeConfig, writer.uint32(98).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTradeRoute();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rewardDenomOnHostZone = reader.string();
                    break;
                case 2:
                    message.rewardDenomOnRewardZone = reader.string();
                    break;
                case 3:
                    message.rewardDenomOnTradeZone = reader.string();
                    break;
                case 4:
                    message.hostDenomOnTradeZone = reader.string();
                    break;
                case 5:
                    message.hostDenomOnHostZone = reader.string();
                    break;
                case 6:
                    message.hostAccount = ICAAccount.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.rewardAccount = ICAAccount.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.tradeAccount = ICAAccount.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.hostToRewardChannelId = reader.string();
                    break;
                case 10:
                    message.rewardToTradeChannelId = reader.string();
                    break;
                case 11:
                    message.tradeToHostChannelId = reader.string();
                    break;
                case 13:
                    message.minTransferAmount = reader.string();
                    break;
                case 12:
                    message.tradeConfig = TradeConfig.decode(reader, reader.uint32());
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
            rewardDenomOnHostZone: isSet(object.rewardDenomOnHostZone)
                ? String(object.rewardDenomOnHostZone)
                : '',
            rewardDenomOnRewardZone: isSet(object.rewardDenomOnRewardZone)
                ? String(object.rewardDenomOnRewardZone)
                : '',
            rewardDenomOnTradeZone: isSet(object.rewardDenomOnTradeZone)
                ? String(object.rewardDenomOnTradeZone)
                : '',
            hostDenomOnTradeZone: isSet(object.hostDenomOnTradeZone)
                ? String(object.hostDenomOnTradeZone)
                : '',
            hostDenomOnHostZone: isSet(object.hostDenomOnHostZone)
                ? String(object.hostDenomOnHostZone)
                : '',
            hostAccount: isSet(object.hostAccount)
                ? ICAAccount.fromJSON(object.hostAccount)
                : undefined,
            rewardAccount: isSet(object.rewardAccount)
                ? ICAAccount.fromJSON(object.rewardAccount)
                : undefined,
            tradeAccount: isSet(object.tradeAccount)
                ? ICAAccount.fromJSON(object.tradeAccount)
                : undefined,
            hostToRewardChannelId: isSet(object.hostToRewardChannelId)
                ? String(object.hostToRewardChannelId)
                : '',
            rewardToTradeChannelId: isSet(object.rewardToTradeChannelId)
                ? String(object.rewardToTradeChannelId)
                : '',
            tradeToHostChannelId: isSet(object.tradeToHostChannelId)
                ? String(object.tradeToHostChannelId)
                : '',
            minTransferAmount: isSet(object.minTransferAmount)
                ? String(object.minTransferAmount)
                : '',
            tradeConfig: isSet(object.tradeConfig)
                ? TradeConfig.fromJSON(object.tradeConfig)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.rewardDenomOnHostZone !== undefined &&
            (obj.rewardDenomOnHostZone = message.rewardDenomOnHostZone);
        message.rewardDenomOnRewardZone !== undefined &&
            (obj.rewardDenomOnRewardZone = message.rewardDenomOnRewardZone);
        message.rewardDenomOnTradeZone !== undefined &&
            (obj.rewardDenomOnTradeZone = message.rewardDenomOnTradeZone);
        message.hostDenomOnTradeZone !== undefined &&
            (obj.hostDenomOnTradeZone = message.hostDenomOnTradeZone);
        message.hostDenomOnHostZone !== undefined &&
            (obj.hostDenomOnHostZone = message.hostDenomOnHostZone);
        message.hostAccount !== undefined &&
            (obj.hostAccount = message.hostAccount
                ? ICAAccount.toJSON(message.hostAccount)
                : undefined);
        message.rewardAccount !== undefined &&
            (obj.rewardAccount = message.rewardAccount
                ? ICAAccount.toJSON(message.rewardAccount)
                : undefined);
        message.tradeAccount !== undefined &&
            (obj.tradeAccount = message.tradeAccount
                ? ICAAccount.toJSON(message.tradeAccount)
                : undefined);
        message.hostToRewardChannelId !== undefined &&
            (obj.hostToRewardChannelId = message.hostToRewardChannelId);
        message.rewardToTradeChannelId !== undefined &&
            (obj.rewardToTradeChannelId = message.rewardToTradeChannelId);
        message.tradeToHostChannelId !== undefined &&
            (obj.tradeToHostChannelId = message.tradeToHostChannelId);
        message.minTransferAmount !== undefined &&
            (obj.minTransferAmount = message.minTransferAmount);
        message.tradeConfig !== undefined &&
            (obj.tradeConfig = message.tradeConfig
                ? TradeConfig.toJSON(message.tradeConfig)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTradeRoute();
        message.rewardDenomOnHostZone = object.rewardDenomOnHostZone ?? '';
        message.rewardDenomOnRewardZone = object.rewardDenomOnRewardZone ?? '';
        message.rewardDenomOnTradeZone = object.rewardDenomOnTradeZone ?? '';
        message.hostDenomOnTradeZone = object.hostDenomOnTradeZone ?? '';
        message.hostDenomOnHostZone = object.hostDenomOnHostZone ?? '';
        message.hostAccount =
            object.hostAccount !== undefined && object.hostAccount !== null
                ? ICAAccount.fromPartial(object.hostAccount)
                : undefined;
        message.rewardAccount =
            object.rewardAccount !== undefined && object.rewardAccount !== null
                ? ICAAccount.fromPartial(object.rewardAccount)
                : undefined;
        message.tradeAccount =
            object.tradeAccount !== undefined && object.tradeAccount !== null
                ? ICAAccount.fromPartial(object.tradeAccount)
                : undefined;
        message.hostToRewardChannelId = object.hostToRewardChannelId ?? '';
        message.rewardToTradeChannelId = object.rewardToTradeChannelId ?? '';
        message.tradeToHostChannelId = object.tradeToHostChannelId ?? '';
        message.minTransferAmount = object.minTransferAmount ?? '';
        message.tradeConfig =
            object.tradeConfig !== undefined && object.tradeConfig !== null
                ? TradeConfig.fromPartial(object.tradeConfig)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return TradeRoute.decode(message.value);
    },
    toProto(message) {
        return TradeRoute.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.TradeRoute',
            value: TradeRoute.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=trade_route.js.map