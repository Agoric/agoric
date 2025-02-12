//@ts-nocheck
import { HostZone, DelegationRecord, UnbondingRecord, RedemptionRecord, SlashRecord, } from './stakedym.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet } from '../../helpers.js';
function createBaseParams() {
    return {};
}
export const Params = {
    typeUrl: '/stride.stakedym.Params',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
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
        const message = createBaseParams();
        return message;
    },
    fromProtoMsg(message) {
        return Params.decode(message.value);
    },
    toProto(message) {
        return Params.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseTransferInProgressRecordIds() {
    return {
        channelId: '',
        sequence: BigInt(0),
        recordId: BigInt(0),
    };
}
export const TransferInProgressRecordIds = {
    typeUrl: '/stride.stakedym.TransferInProgressRecordIds',
    encode(message, writer = BinaryWriter.create()) {
        if (message.channelId !== '') {
            writer.uint32(10).string(message.channelId);
        }
        if (message.sequence !== BigInt(0)) {
            writer.uint32(16).uint64(message.sequence);
        }
        if (message.recordId !== BigInt(0)) {
            writer.uint32(24).uint64(message.recordId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTransferInProgressRecordIds();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.channelId = reader.string();
                    break;
                case 2:
                    message.sequence = reader.uint64();
                    break;
                case 3:
                    message.recordId = reader.uint64();
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
            channelId: isSet(object.channelId) ? String(object.channelId) : '',
            sequence: isSet(object.sequence)
                ? BigInt(object.sequence.toString())
                : BigInt(0),
            recordId: isSet(object.recordId)
                ? BigInt(object.recordId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.channelId !== undefined && (obj.channelId = message.channelId);
        message.sequence !== undefined &&
            (obj.sequence = (message.sequence || BigInt(0)).toString());
        message.recordId !== undefined &&
            (obj.recordId = (message.recordId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTransferInProgressRecordIds();
        message.channelId = object.channelId ?? '';
        message.sequence =
            object.sequence !== undefined && object.sequence !== null
                ? BigInt(object.sequence.toString())
                : BigInt(0);
        message.recordId =
            object.recordId !== undefined && object.recordId !== null
                ? BigInt(object.recordId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return TransferInProgressRecordIds.decode(message.value);
    },
    toProto(message) {
        return TransferInProgressRecordIds.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.TransferInProgressRecordIds',
            value: TransferInProgressRecordIds.encode(message).finish(),
        };
    },
};
function createBaseGenesisState() {
    return {
        params: Params.fromPartial({}),
        hostZone: HostZone.fromPartial({}),
        delegationRecords: [],
        unbondingRecords: [],
        redemptionRecords: [],
        slashRecords: [],
        transferInProgressRecordIds: [],
    };
}
export const GenesisState = {
    typeUrl: '/stride.stakedym.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(10).fork()).ldelim();
        }
        if (message.hostZone !== undefined) {
            HostZone.encode(message.hostZone, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.delegationRecords) {
            DelegationRecord.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.unbondingRecords) {
            UnbondingRecord.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.redemptionRecords) {
            RedemptionRecord.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.slashRecords) {
            SlashRecord.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.transferInProgressRecordIds) {
            TransferInProgressRecordIds.encode(v, writer.uint32(58).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseGenesisState();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params = Params.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.hostZone = HostZone.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.delegationRecords.push(DelegationRecord.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.unbondingRecords.push(UnbondingRecord.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.redemptionRecords.push(RedemptionRecord.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.slashRecords.push(SlashRecord.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.transferInProgressRecordIds.push(TransferInProgressRecordIds.decode(reader, reader.uint32()));
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
            hostZone: isSet(object.hostZone)
                ? HostZone.fromJSON(object.hostZone)
                : undefined,
            delegationRecords: Array.isArray(object?.delegationRecords)
                ? object.delegationRecords.map((e) => DelegationRecord.fromJSON(e))
                : [],
            unbondingRecords: Array.isArray(object?.unbondingRecords)
                ? object.unbondingRecords.map((e) => UnbondingRecord.fromJSON(e))
                : [],
            redemptionRecords: Array.isArray(object?.redemptionRecords)
                ? object.redemptionRecords.map((e) => RedemptionRecord.fromJSON(e))
                : [],
            slashRecords: Array.isArray(object?.slashRecords)
                ? object.slashRecords.map((e) => SlashRecord.fromJSON(e))
                : [],
            transferInProgressRecordIds: Array.isArray(object?.transferInProgressRecordIds)
                ? object.transferInProgressRecordIds.map((e) => TransferInProgressRecordIds.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        message.hostZone !== undefined &&
            (obj.hostZone = message.hostZone
                ? HostZone.toJSON(message.hostZone)
                : undefined);
        if (message.delegationRecords) {
            obj.delegationRecords = message.delegationRecords.map(e => e ? DelegationRecord.toJSON(e) : undefined);
        }
        else {
            obj.delegationRecords = [];
        }
        if (message.unbondingRecords) {
            obj.unbondingRecords = message.unbondingRecords.map(e => e ? UnbondingRecord.toJSON(e) : undefined);
        }
        else {
            obj.unbondingRecords = [];
        }
        if (message.redemptionRecords) {
            obj.redemptionRecords = message.redemptionRecords.map(e => e ? RedemptionRecord.toJSON(e) : undefined);
        }
        else {
            obj.redemptionRecords = [];
        }
        if (message.slashRecords) {
            obj.slashRecords = message.slashRecords.map(e => e ? SlashRecord.toJSON(e) : undefined);
        }
        else {
            obj.slashRecords = [];
        }
        if (message.transferInProgressRecordIds) {
            obj.transferInProgressRecordIds = message.transferInProgressRecordIds.map(e => (e ? TransferInProgressRecordIds.toJSON(e) : undefined));
        }
        else {
            obj.transferInProgressRecordIds = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        message.hostZone =
            object.hostZone !== undefined && object.hostZone !== null
                ? HostZone.fromPartial(object.hostZone)
                : undefined;
        message.delegationRecords =
            object.delegationRecords?.map(e => DelegationRecord.fromPartial(e)) || [];
        message.unbondingRecords =
            object.unbondingRecords?.map(e => UnbondingRecord.fromPartial(e)) || [];
        message.redemptionRecords =
            object.redemptionRecords?.map(e => RedemptionRecord.fromPartial(e)) || [];
        message.slashRecords =
            object.slashRecords?.map(e => SlashRecord.fromPartial(e)) || [];
        message.transferInProgressRecordIds =
            object.transferInProgressRecordIds?.map(e => TransferInProgressRecordIds.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return GenesisState.decode(message.value);
    },
    toProto(message) {
        return GenesisState.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakedym.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map