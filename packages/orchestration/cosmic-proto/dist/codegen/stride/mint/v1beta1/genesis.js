//@ts-nocheck
import { Minter, Params, } from './mint.js';
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { isSet } from '../../../helpers.js';
import {} from '../../../json-safe.js';
function createBaseGenesisState() {
    return {
        minter: Minter.fromPartial({}),
        params: Params.fromPartial({}),
        reductionStartedEpoch: BigInt(0),
    };
}
export const GenesisState = {
    typeUrl: '/stride.mint.v1beta1.GenesisState',
    encode(message, writer = BinaryWriter.create()) {
        if (message.minter !== undefined) {
            Minter.encode(message.minter, writer.uint32(10).fork()).ldelim();
        }
        if (message.params !== undefined) {
            Params.encode(message.params, writer.uint32(18).fork()).ldelim();
        }
        if (message.reductionStartedEpoch !== BigInt(0)) {
            writer.uint32(24).int64(message.reductionStartedEpoch);
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
                    message.minter = Minter.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.params = Params.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.reductionStartedEpoch = reader.int64();
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
            minter: isSet(object.minter) ? Minter.fromJSON(object.minter) : undefined,
            params: isSet(object.params) ? Params.fromJSON(object.params) : undefined,
            reductionStartedEpoch: isSet(object.reductionStartedEpoch)
                ? BigInt(object.reductionStartedEpoch.toString())
                : BigInt(0),
        };
    },
    toJSON(message) {
        const obj = {};
        message.minter !== undefined &&
            (obj.minter = message.minter ? Minter.toJSON(message.minter) : undefined);
        message.params !== undefined &&
            (obj.params = message.params ? Params.toJSON(message.params) : undefined);
        message.reductionStartedEpoch !== undefined &&
            (obj.reductionStartedEpoch = (message.reductionStartedEpoch || BigInt(0)).toString());
        return obj;
    },
    fromPartial(object) {
        const message = createBaseGenesisState();
        message.minter =
            object.minter !== undefined && object.minter !== null
                ? Minter.fromPartial(object.minter)
                : undefined;
        message.params =
            object.params !== undefined && object.params !== null
                ? Params.fromPartial(object.params)
                : undefined;
        message.reductionStartedEpoch =
            object.reductionStartedEpoch !== undefined &&
                object.reductionStartedEpoch !== null
                ? BigInt(object.reductionStartedEpoch.toString())
                : BigInt(0);
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
            typeUrl: '/stride.mint.v1beta1.GenesisState',
            value: GenesisState.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=genesis.js.map