//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import {} from '../../json-safe.js';
function createBaseIcacallbacksPacketData() {
    return {
        noData: undefined,
    };
}
export const IcacallbacksPacketData = {
    typeUrl: '/stride.icacallbacks.IcacallbacksPacketData',
    encode(message, writer = BinaryWriter.create()) {
        if (message.noData !== undefined) {
            NoData.encode(message.noData, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseIcacallbacksPacketData();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.noData = NoData.decode(reader, reader.uint32());
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
            noData: isSet(object.noData) ? NoData.fromJSON(object.noData) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.noData !== undefined &&
            (obj.noData = message.noData ? NoData.toJSON(message.noData) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseIcacallbacksPacketData();
        message.noData =
            object.noData !== undefined && object.noData !== null
                ? NoData.fromPartial(object.noData)
                : undefined;
        return message;
    },
    fromProtoMsg(message) {
        return IcacallbacksPacketData.decode(message.value);
    },
    toProto(message) {
        return IcacallbacksPacketData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.IcacallbacksPacketData',
            value: IcacallbacksPacketData.encode(message).finish(),
        };
    },
};
function createBaseNoData() {
    return {};
}
export const NoData = {
    typeUrl: '/stride.icacallbacks.NoData',
    encode(_, writer = BinaryWriter.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseNoData();
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
        const message = createBaseNoData();
        return message;
    },
    fromProtoMsg(message) {
        return NoData.decode(message.value);
    },
    toProto(message) {
        return NoData.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.icacallbacks.NoData',
            value: NoData.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=packet.js.map