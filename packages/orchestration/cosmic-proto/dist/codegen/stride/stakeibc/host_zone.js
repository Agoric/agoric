//@ts-nocheck
import { Validator } from './validator.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal, isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseCommunityPoolRebate() {
    return {
        rebateRate: '',
        liquidStakedStTokenAmount: '',
    };
}
export const CommunityPoolRebate = {
    typeUrl: '/stride.stakeibc.CommunityPoolRebate',
    encode(message, writer = BinaryWriter.create()) {
        if (message.rebateRate !== '') {
            writer
                .uint32(10)
                .string(Decimal.fromUserInput(message.rebateRate, 18).atomics);
        }
        if (message.liquidStakedStTokenAmount !== '') {
            writer.uint32(18).string(message.liquidStakedStTokenAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCommunityPoolRebate();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.rebateRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 2:
                    message.liquidStakedStTokenAmount = reader.string();
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
            rebateRate: isSet(object.rebateRate) ? String(object.rebateRate) : '',
            liquidStakedStTokenAmount: isSet(object.liquidStakedStTokenAmount)
                ? String(object.liquidStakedStTokenAmount)
                : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.rebateRate !== undefined && (obj.rebateRate = message.rebateRate);
        message.liquidStakedStTokenAmount !== undefined &&
            (obj.liquidStakedStTokenAmount = message.liquidStakedStTokenAmount);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCommunityPoolRebate();
        message.rebateRate = object.rebateRate ?? '';
        message.liquidStakedStTokenAmount = object.liquidStakedStTokenAmount ?? '';
        return message;
    },
    fromProtoMsg(message) {
        return CommunityPoolRebate.decode(message.value);
    },
    toProto(message) {
        return CommunityPoolRebate.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.CommunityPoolRebate',
            value: CommunityPoolRebate.encode(message).finish(),
        };
    },
};
function createBaseHostZone() {
    return {
        chainId: '',
        bech32prefix: '',
        connectionId: '',
        transferChannelId: '',
        ibcDenom: '',
        hostDenom: '',
        unbondingPeriod: BigInt(0),
        validators: [],
        depositAddress: '',
        withdrawalIcaAddress: '',
        feeIcaAddress: '',
        delegationIcaAddress: '',
        redemptionIcaAddress: '',
        communityPoolDepositIcaAddress: '',
        communityPoolReturnIcaAddress: '',
        communityPoolStakeHoldingAddress: '',
        communityPoolRedeemHoldingAddress: '',
        communityPoolTreasuryAddress: '',
        totalDelegations: '',
        lastRedemptionRate: '',
        redemptionRate: '',
        minRedemptionRate: '',
        maxRedemptionRate: '',
        minInnerRedemptionRate: '',
        maxInnerRedemptionRate: '',
        maxMessagesPerIcaTx: BigInt(0),
        redemptionsEnabled: false,
        communityPoolRebate: undefined,
        lsmLiquidStakeEnabled: false,
        halted: false,
    };
}
export const HostZone = {
    typeUrl: '/stride.stakeibc.HostZone',
    encode(message, writer = BinaryWriter.create()) {
        if (message.chainId !== '') {
            writer.uint32(10).string(message.chainId);
        }
        if (message.bech32prefix !== '') {
            writer.uint32(138).string(message.bech32prefix);
        }
        if (message.connectionId !== '') {
            writer.uint32(18).string(message.connectionId);
        }
        if (message.transferChannelId !== '') {
            writer.uint32(98).string(message.transferChannelId);
        }
        if (message.ibcDenom !== '') {
            writer.uint32(66).string(message.ibcDenom);
        }
        if (message.hostDenom !== '') {
            writer.uint32(74).string(message.hostDenom);
        }
        if (message.unbondingPeriod !== BigInt(0)) {
            writer.uint32(208).uint64(message.unbondingPeriod);
        }
        for (const v of message.validators) {
            Validator.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.depositAddress !== '') {
            writer.uint32(146).string(message.depositAddress);
        }
        if (message.withdrawalIcaAddress !== '') {
            writer.uint32(178).string(message.withdrawalIcaAddress);
        }
        if (message.feeIcaAddress !== '') {
            writer.uint32(186).string(message.feeIcaAddress);
        }
        if (message.delegationIcaAddress !== '') {
            writer.uint32(194).string(message.delegationIcaAddress);
        }
        if (message.redemptionIcaAddress !== '') {
            writer.uint32(202).string(message.redemptionIcaAddress);
        }
        if (message.communityPoolDepositIcaAddress !== '') {
            writer.uint32(242).string(message.communityPoolDepositIcaAddress);
        }
        if (message.communityPoolReturnIcaAddress !== '') {
            writer.uint32(250).string(message.communityPoolReturnIcaAddress);
        }
        if (message.communityPoolStakeHoldingAddress !== '') {
            writer.uint32(258).string(message.communityPoolStakeHoldingAddress);
        }
        if (message.communityPoolRedeemHoldingAddress !== '') {
            writer.uint32(266).string(message.communityPoolRedeemHoldingAddress);
        }
        if (message.communityPoolTreasuryAddress !== '') {
            writer.uint32(282).string(message.communityPoolTreasuryAddress);
        }
        if (message.totalDelegations !== '') {
            writer.uint32(106).string(message.totalDelegations);
        }
        if (message.lastRedemptionRate !== '') {
            writer
                .uint32(82)
                .string(Decimal.fromUserInput(message.lastRedemptionRate, 18).atomics);
        }
        if (message.redemptionRate !== '') {
            writer
                .uint32(90)
                .string(Decimal.fromUserInput(message.redemptionRate, 18).atomics);
        }
        if (message.minRedemptionRate !== '') {
            writer
                .uint32(162)
                .string(Decimal.fromUserInput(message.minRedemptionRate, 18).atomics);
        }
        if (message.maxRedemptionRate !== '') {
            writer
                .uint32(170)
                .string(Decimal.fromUserInput(message.maxRedemptionRate, 18).atomics);
        }
        if (message.minInnerRedemptionRate !== '') {
            writer
                .uint32(226)
                .string(Decimal.fromUserInput(message.minInnerRedemptionRate, 18).atomics);
        }
        if (message.maxInnerRedemptionRate !== '') {
            writer
                .uint32(234)
                .string(Decimal.fromUserInput(message.maxInnerRedemptionRate, 18).atomics);
        }
        if (message.maxMessagesPerIcaTx !== BigInt(0)) {
            writer.uint32(288).uint64(message.maxMessagesPerIcaTx);
        }
        if (message.redemptionsEnabled === true) {
            writer.uint32(296).bool(message.redemptionsEnabled);
        }
        if (message.communityPoolRebate !== undefined) {
            CommunityPoolRebate.encode(message.communityPoolRebate, writer.uint32(274).fork()).ldelim();
        }
        if (message.lsmLiquidStakeEnabled === true) {
            writer.uint32(216).bool(message.lsmLiquidStakeEnabled);
        }
        if (message.halted === true) {
            writer.uint32(152).bool(message.halted);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHostZone();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chainId = reader.string();
                    break;
                case 17:
                    message.bech32prefix = reader.string();
                    break;
                case 2:
                    message.connectionId = reader.string();
                    break;
                case 12:
                    message.transferChannelId = reader.string();
                    break;
                case 8:
                    message.ibcDenom = reader.string();
                    break;
                case 9:
                    message.hostDenom = reader.string();
                    break;
                case 26:
                    message.unbondingPeriod = reader.uint64();
                    break;
                case 3:
                    message.validators.push(Validator.decode(reader, reader.uint32()));
                    break;
                case 18:
                    message.depositAddress = reader.string();
                    break;
                case 22:
                    message.withdrawalIcaAddress = reader.string();
                    break;
                case 23:
                    message.feeIcaAddress = reader.string();
                    break;
                case 24:
                    message.delegationIcaAddress = reader.string();
                    break;
                case 25:
                    message.redemptionIcaAddress = reader.string();
                    break;
                case 30:
                    message.communityPoolDepositIcaAddress = reader.string();
                    break;
                case 31:
                    message.communityPoolReturnIcaAddress = reader.string();
                    break;
                case 32:
                    message.communityPoolStakeHoldingAddress = reader.string();
                    break;
                case 33:
                    message.communityPoolRedeemHoldingAddress = reader.string();
                    break;
                case 35:
                    message.communityPoolTreasuryAddress = reader.string();
                    break;
                case 13:
                    message.totalDelegations = reader.string();
                    break;
                case 10:
                    message.lastRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 11:
                    message.redemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 20:
                    message.minRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 21:
                    message.maxRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 28:
                    message.minInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 29:
                    message.maxInnerRedemptionRate = Decimal.fromAtomics(reader.string(), 18).toString();
                    break;
                case 36:
                    message.maxMessagesPerIcaTx = reader.uint64();
                    break;
                case 37:
                    message.redemptionsEnabled = reader.bool();
                    break;
                case 34:
                    message.communityPoolRebate = CommunityPoolRebate.decode(reader, reader.uint32());
                    break;
                case 27:
                    message.lsmLiquidStakeEnabled = reader.bool();
                    break;
                case 19:
                    message.halted = reader.bool();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            bech32prefix: isSet(object.bech32prefix)
                ? String(object.bech32prefix)
                : '',
            connectionId: isSet(object.connectionId)
                ? String(object.connectionId)
                : '',
            transferChannelId: isSet(object.transferChannelId)
                ? String(object.transferChannelId)
                : '',
            ibcDenom: isSet(object.ibcDenom) ? String(object.ibcDenom) : '',
            hostDenom: isSet(object.hostDenom) ? String(object.hostDenom) : '',
            unbondingPeriod: isSet(object.unbondingPeriod)
                ? BigInt(object.unbondingPeriod.toString())
                : BigInt(0),
            validators: Array.isArray(object?.validators)
                ? object.validators.map((e) => Validator.fromJSON(e))
                : [],
            depositAddress: isSet(object.depositAddress)
                ? String(object.depositAddress)
                : '',
            withdrawalIcaAddress: isSet(object.withdrawalIcaAddress)
                ? String(object.withdrawalIcaAddress)
                : '',
            feeIcaAddress: isSet(object.feeIcaAddress)
                ? String(object.feeIcaAddress)
                : '',
            delegationIcaAddress: isSet(object.delegationIcaAddress)
                ? String(object.delegationIcaAddress)
                : '',
            redemptionIcaAddress: isSet(object.redemptionIcaAddress)
                ? String(object.redemptionIcaAddress)
                : '',
            communityPoolDepositIcaAddress: isSet(object.communityPoolDepositIcaAddress)
                ? String(object.communityPoolDepositIcaAddress)
                : '',
            communityPoolReturnIcaAddress: isSet(object.communityPoolReturnIcaAddress)
                ? String(object.communityPoolReturnIcaAddress)
                : '',
            communityPoolStakeHoldingAddress: isSet(object.communityPoolStakeHoldingAddress)
                ? String(object.communityPoolStakeHoldingAddress)
                : '',
            communityPoolRedeemHoldingAddress: isSet(object.communityPoolRedeemHoldingAddress)
                ? String(object.communityPoolRedeemHoldingAddress)
                : '',
            communityPoolTreasuryAddress: isSet(object.communityPoolTreasuryAddress)
                ? String(object.communityPoolTreasuryAddress)
                : '',
            totalDelegations: isSet(object.totalDelegations)
                ? String(object.totalDelegations)
                : '',
            lastRedemptionRate: isSet(object.lastRedemptionRate)
                ? String(object.lastRedemptionRate)
                : '',
            redemptionRate: isSet(object.redemptionRate)
                ? String(object.redemptionRate)
                : '',
            minRedemptionRate: isSet(object.minRedemptionRate)
                ? String(object.minRedemptionRate)
                : '',
            maxRedemptionRate: isSet(object.maxRedemptionRate)
                ? String(object.maxRedemptionRate)
                : '',
            minInnerRedemptionRate: isSet(object.minInnerRedemptionRate)
                ? String(object.minInnerRedemptionRate)
                : '',
            maxInnerRedemptionRate: isSet(object.maxInnerRedemptionRate)
                ? String(object.maxInnerRedemptionRate)
                : '',
            maxMessagesPerIcaTx: isSet(object.maxMessagesPerIcaTx)
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0),
            redemptionsEnabled: isSet(object.redemptionsEnabled)
                ? Boolean(object.redemptionsEnabled)
                : false,
            communityPoolRebate: isSet(object.communityPoolRebate)
                ? CommunityPoolRebate.fromJSON(object.communityPoolRebate)
                : undefined,
            lsmLiquidStakeEnabled: isSet(object.lsmLiquidStakeEnabled)
                ? Boolean(object.lsmLiquidStakeEnabled)
                : false,
            halted: isSet(object.halted) ? Boolean(object.halted) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.bech32prefix !== undefined &&
            (obj.bech32prefix = message.bech32prefix);
        message.connectionId !== undefined &&
            (obj.connectionId = message.connectionId);
        message.transferChannelId !== undefined &&
            (obj.transferChannelId = message.transferChannelId);
        message.ibcDenom !== undefined && (obj.ibcDenom = message.ibcDenom);
        message.hostDenom !== undefined && (obj.hostDenom = message.hostDenom);
        message.unbondingPeriod !== undefined &&
            (obj.unbondingPeriod = (message.unbondingPeriod || BigInt(0)).toString());
        if (message.validators) {
            obj.validators = message.validators.map(e => e ? Validator.toJSON(e) : undefined);
        }
        else {
            obj.validators = [];
        }
        message.depositAddress !== undefined &&
            (obj.depositAddress = message.depositAddress);
        message.withdrawalIcaAddress !== undefined &&
            (obj.withdrawalIcaAddress = message.withdrawalIcaAddress);
        message.feeIcaAddress !== undefined &&
            (obj.feeIcaAddress = message.feeIcaAddress);
        message.delegationIcaAddress !== undefined &&
            (obj.delegationIcaAddress = message.delegationIcaAddress);
        message.redemptionIcaAddress !== undefined &&
            (obj.redemptionIcaAddress = message.redemptionIcaAddress);
        message.communityPoolDepositIcaAddress !== undefined &&
            (obj.communityPoolDepositIcaAddress =
                message.communityPoolDepositIcaAddress);
        message.communityPoolReturnIcaAddress !== undefined &&
            (obj.communityPoolReturnIcaAddress =
                message.communityPoolReturnIcaAddress);
        message.communityPoolStakeHoldingAddress !== undefined &&
            (obj.communityPoolStakeHoldingAddress =
                message.communityPoolStakeHoldingAddress);
        message.communityPoolRedeemHoldingAddress !== undefined &&
            (obj.communityPoolRedeemHoldingAddress =
                message.communityPoolRedeemHoldingAddress);
        message.communityPoolTreasuryAddress !== undefined &&
            (obj.communityPoolTreasuryAddress = message.communityPoolTreasuryAddress);
        message.totalDelegations !== undefined &&
            (obj.totalDelegations = message.totalDelegations);
        message.lastRedemptionRate !== undefined &&
            (obj.lastRedemptionRate = message.lastRedemptionRate);
        message.redemptionRate !== undefined &&
            (obj.redemptionRate = message.redemptionRate);
        message.minRedemptionRate !== undefined &&
            (obj.minRedemptionRate = message.minRedemptionRate);
        message.maxRedemptionRate !== undefined &&
            (obj.maxRedemptionRate = message.maxRedemptionRate);
        message.minInnerRedemptionRate !== undefined &&
            (obj.minInnerRedemptionRate = message.minInnerRedemptionRate);
        message.maxInnerRedemptionRate !== undefined &&
            (obj.maxInnerRedemptionRate = message.maxInnerRedemptionRate);
        message.maxMessagesPerIcaTx !== undefined &&
            (obj.maxMessagesPerIcaTx = (message.maxMessagesPerIcaTx || BigInt(0)).toString());
        message.redemptionsEnabled !== undefined &&
            (obj.redemptionsEnabled = message.redemptionsEnabled);
        message.communityPoolRebate !== undefined &&
            (obj.communityPoolRebate = message.communityPoolRebate
                ? CommunityPoolRebate.toJSON(message.communityPoolRebate)
                : undefined);
        message.lsmLiquidStakeEnabled !== undefined &&
            (obj.lsmLiquidStakeEnabled = message.lsmLiquidStakeEnabled);
        message.halted !== undefined && (obj.halted = message.halted);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHostZone();
        message.chainId = object.chainId ?? '';
        message.bech32prefix = object.bech32prefix ?? '';
        message.connectionId = object.connectionId ?? '';
        message.transferChannelId = object.transferChannelId ?? '';
        message.ibcDenom = object.ibcDenom ?? '';
        message.hostDenom = object.hostDenom ?? '';
        message.unbondingPeriod =
            object.unbondingPeriod !== undefined && object.unbondingPeriod !== null
                ? BigInt(object.unbondingPeriod.toString())
                : BigInt(0);
        message.validators =
            object.validators?.map(e => Validator.fromPartial(e)) || [];
        message.depositAddress = object.depositAddress ?? '';
        message.withdrawalIcaAddress = object.withdrawalIcaAddress ?? '';
        message.feeIcaAddress = object.feeIcaAddress ?? '';
        message.delegationIcaAddress = object.delegationIcaAddress ?? '';
        message.redemptionIcaAddress = object.redemptionIcaAddress ?? '';
        message.communityPoolDepositIcaAddress =
            object.communityPoolDepositIcaAddress ?? '';
        message.communityPoolReturnIcaAddress =
            object.communityPoolReturnIcaAddress ?? '';
        message.communityPoolStakeHoldingAddress =
            object.communityPoolStakeHoldingAddress ?? '';
        message.communityPoolRedeemHoldingAddress =
            object.communityPoolRedeemHoldingAddress ?? '';
        message.communityPoolTreasuryAddress =
            object.communityPoolTreasuryAddress ?? '';
        message.totalDelegations = object.totalDelegations ?? '';
        message.lastRedemptionRate = object.lastRedemptionRate ?? '';
        message.redemptionRate = object.redemptionRate ?? '';
        message.minRedemptionRate = object.minRedemptionRate ?? '';
        message.maxRedemptionRate = object.maxRedemptionRate ?? '';
        message.minInnerRedemptionRate = object.minInnerRedemptionRate ?? '';
        message.maxInnerRedemptionRate = object.maxInnerRedemptionRate ?? '';
        message.maxMessagesPerIcaTx =
            object.maxMessagesPerIcaTx !== undefined &&
                object.maxMessagesPerIcaTx !== null
                ? BigInt(object.maxMessagesPerIcaTx.toString())
                : BigInt(0);
        message.redemptionsEnabled = object.redemptionsEnabled ?? false;
        message.communityPoolRebate =
            object.communityPoolRebate !== undefined &&
                object.communityPoolRebate !== null
                ? CommunityPoolRebate.fromPartial(object.communityPoolRebate)
                : undefined;
        message.lsmLiquidStakeEnabled = object.lsmLiquidStakeEnabled ?? false;
        message.halted = object.halted ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return HostZone.decode(message.value);
    },
    toProto(message) {
        return HostZone.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.HostZone',
            value: HostZone.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=host_zone.js.map