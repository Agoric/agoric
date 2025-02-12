//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseAddressUnbonding() {
    return {
        address: '',
        receiver: '',
        unbondingEstimatedTime: '',
        amount: '',
        denom: '',
        claimIsPending: false,
        epochNumber: BigInt(0),
    };
}
export const AddressUnbonding = {
    typeUrl: '/stride.stakeibc.AddressUnbonding',
    encode(message, writer = BinaryWriter.create()) {
        if (message.address !== '') {
            writer.uint32(10).string(message.address);
        }
        if (message.receiver !== '') {
            writer.uint32(18).string(message.receiver);
        }
        if (message.unbondingEstimatedTime !== '') {
            writer.uint32(26).string(message.unbondingEstimatedTime);
        }
        if (message.amount !== '') {
            writer.uint32(34).string(message.amount);
        }
        if (message.denom !== '') {
            writer.uint32(42).string(message.denom);
        }
        if (message.claimIsPending === true) {
            writer.uint32(64).bool(message.claimIsPending);
        }
        if (message.epochNumber !== BigInt(0)) {
            writer.uint32(72).uint64(message.epochNumber);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAddressUnbonding();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.address = reader.string();
                    break;
                case 2:
                    message.receiver = reader.string();
                    break;
                case 3:
                    message.unbondingEstimatedTime = reader.string();
                    break;
                case 4:
                    message.amount = reader.string();
                    break;
                case 5:
                    message.denom = reader.string();
                    break;
                case 8:
                    message.claimIsPending = reader.bool();
                    break;
                case 9:
                    message.epochNumber = reader.uint64();
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
            receiver: isSet(object.receiver) ? String(object.receiver) : '',
            unbondingEstimatedTime: isSet(object.unbondingEstimatedTime)
                ? String(object.unbondingEstimatedTime)
                : '',
            amount: isSet(object.amount) ? String(object.amount) : '',
            denom: isSet(object.denom) ? String(object.denom) : '',
            claimIsPending: isSet(object.claimIsPending)
                ? Boolean(object.claimIsPending)
                : false,
            epochNumber: isSet(object.epochNumber)
                ? BigInt(object.epochNumber.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.address !== undefined && (obj.address = message.address);
        message.receiver !== undefined && (obj.receiver = message.receiver);
        message.unbondingEstimatedTime !== undefined &&
            (obj.unbondingEstimatedTime = message.unbondingEstimatedTime);
        message.amount !== undefined && (obj.amount = message.amount);
        message.denom !== undefined && (obj.denom = message.denom);
        message.claimIsPending !== undefined &&
            (obj.claimIsPending = message.claimIsPending);
        message.epochNumber !== undefined &&
            (obj.epochNumber = (message.epochNumber || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAddressUnbonding();
        message.address = object.address ?? '';
        message.receiver = object.receiver ?? '';
        message.unbondingEstimatedTime = object.unbondingEstimatedTime ?? '';
        message.amount = object.amount ?? '';
        message.denom = object.denom ?? '';
        message.claimIsPending = object.claimIsPending ?? false;
        message.epochNumber =
            object.epochNumber !== undefined && object.epochNumber !== null
                ? BigInt(object.epochNumber.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return AddressUnbonding.decode(message.value);
    },
    toProto(message) {
        return AddressUnbonding.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.stakeibc.AddressUnbonding',
            value: AddressUnbonding.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=address_unbonding.js.map