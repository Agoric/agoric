//@ts-nocheck
import { LSMTokenDeposit } from './records.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseTransferCallback() {
    return {
        depositRecordId: BigInt(0),
    };
}
export const TransferCallback = {
    typeUrl: '/stride.records.TransferCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.depositRecordId !== BigInt(0)) {
            writer.uint32(8).uint64(message.depositRecordId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTransferCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.depositRecordId = reader.uint64();
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
            depositRecordId: isSet(object.depositRecordId)
                ? BigInt(object.depositRecordId.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.depositRecordId !== undefined &&
            (obj.depositRecordId = (message.depositRecordId || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTransferCallback();
        message.depositRecordId =
            object.depositRecordId !== undefined && object.depositRecordId !== null
                ? BigInt(object.depositRecordId.toString())
                : BigInt(0);
        return message;
    },
    fromProtoMsg(message) {
        return TransferCallback.decode(message.value);
    },
    toProto(message) {
        return TransferCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.TransferCallback',
            value: TransferCallback.encode(message).finish(),
        };
    },
};
function createBaseTransferLSMTokenCallback() {
    return {
        deposit: undefined,
    };
}
export const TransferLSMTokenCallback = {
    typeUrl: '/stride.records.TransferLSMTokenCallback',
    encode(message, writer = BinaryWriter.create()) {
        if (message.deposit !== undefined) {
            LSMTokenDeposit.encode(message.deposit, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTransferLSMTokenCallback();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.deposit = LSMTokenDeposit.decode(reader, reader.uint32());
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
            deposit: isSet(object.deposit)
                ? LSMTokenDeposit.fromJSON(object.deposit)
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.deposit !== undefined &&
            (obj.deposit = message.deposit
                ? LSMTokenDeposit.toJSON(message.deposit)
                : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseTransferLSMTokenCallback();
        message.deposit =
            object.deposit !== undefined && object.deposit !== null
                ? LSMTokenDeposit.fromPartial(object.deposit)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return TransferLSMTokenCallback.decode(message.value);
    },
    toProto(message) {
        return TransferLSMTokenCallback.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.records.TransferLSMTokenCallback',
            value: TransferLSMTokenCallback.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=callbacks.js.map