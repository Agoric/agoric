//@ts-nocheck
import { Coin, } from '../../../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../../../binary.js';
import { isSet } from '../../../../helpers.js';
import {} from '../../../../json-safe.js';
function createBaseAllocation() {
    return {
        sourcePort: '',
        sourceChannel: '',
        spendLimit: [],
        allowList: [],
    };
}
export const Allocation = {
    typeUrl: '/ibc.applications.transfer.v1.Allocation',
    encode(message, writer = BinaryWriter.create()) {
        if (message.sourcePort !== '') {
            writer.uint32(10).string(message.sourcePort);
        }
        if (message.sourceChannel !== '') {
            writer.uint32(18).string(message.sourceChannel);
        }
        for (const v of message.spendLimit) {
            Coin.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.allowList) {
            writer.uint32(34).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAllocation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sourcePort = reader.string();
                    break;
                case 2:
                    message.sourceChannel = reader.string();
                    break;
                case 3:
                    message.spendLimit.push(Coin.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.allowList.push(reader.string());
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
            sourcePort: isSet(object.sourcePort) ? String(object.sourcePort) : '',
            sourceChannel: isSet(object.sourceChannel)
                ? String(object.sourceChannel)
                : '',
            spendLimit: Array.isArray(object?.spendLimit)
                ? object.spendLimit.map((e) => Coin.fromJSON(e))
                : [],
            allowList: Array.isArray(object?.allowList)
                ? object.allowList.map((e) => String(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.sourcePort !== undefined && (obj.sourcePort = message.sourcePort);
        message.sourceChannel !== undefined &&
            (obj.sourceChannel = message.sourceChannel);
        if (message.spendLimit) {
            obj.spendLimit = message.spendLimit.map(e => e ? Coin.toJSON(e) : undefined);
        }
        else {
            obj.spendLimit = [];
        }
        if (message.allowList) {
            obj.allowList = message.allowList.map(e => e);
        }
        else {
            obj.allowList = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAllocation();
        message.sourcePort = object.sourcePort ?? '';
        message.sourceChannel = object.sourceChannel ?? '';
        message.spendLimit = object.spendLimit?.map(e => Coin.fromPartial(e)) || [];
        message.allowList = object.allowList?.map(e => e) || [];
        return message;
    },
    fromProtoMsg(message) {
        return Allocation.decode(message.value);
    },
    toProto(message) {
        return Allocation.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.Allocation',
            value: Allocation.encode(message).finish(),
        };
    },
};
function createBaseTransferAuthorization() {
    return {
        $typeUrl: '/ibc.applications.transfer.v1.TransferAuthorization',
        allocations: [],
    };
}
export const TransferAuthorization = {
    typeUrl: '/ibc.applications.transfer.v1.TransferAuthorization',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.allocations) {
            Allocation.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTransferAuthorization();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.allocations.push(Allocation.decode(reader, reader.uint32()));
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
            allocations: Array.isArray(object?.allocations)
                ? object.allocations.map((e) => Allocation.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.allocations) {
            obj.allocations = message.allocations.map(e => e ? Allocation.toJSON(e) : undefined);
        }
        else {
            obj.allocations = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTransferAuthorization();
        message.allocations =
            object.allocations?.map(e => Allocation.fromPartial(e)) || [];
        return message;
    },
    fromProtoMsg(message) {
        return TransferAuthorization.decode(message.value);
    },
    toProto(message) {
        return TransferAuthorization.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/ibc.applications.transfer.v1.TransferAuthorization',
            value: TransferAuthorization.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=authz.js.map