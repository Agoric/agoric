//@ts-nocheck
import { Timestamp, } from '../../google/protobuf/timestamp.js';
import { Duration, } from '../../google/protobuf/duration.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import {} from '../../json-safe.js';
import { isSet, fromJsonTimestamp, fromTimestamp } from '../../helpers.js';
function createBaseParams() {
    return {
        airdrops: [],
    };
}
export const Params = {
    typeUrl: '/stride.claim.Params',
    encode(message, writer = BinaryWriter.create()) {
        for (const v of message.airdrops) {
            Airdrop.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseParams();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdrops.push(Airdrop.decode(reader, reader.uint32()));
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
            airdrops: Array.isArray(object?.airdrops)
                ? object.airdrops.map((e) => Airdrop.fromJSON(e))
                : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.airdrops) {
            obj.airdrops = message.airdrops.map(e => e ? Airdrop.toJSON(e) : undefined);
        }
        else {
            obj.airdrops = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseParams();
        message.airdrops = object.airdrops?.map(e => Airdrop.fromPartial(e)) || [];
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
            typeUrl: '/stride.claim.Params',
            value: Params.encode(message).finish(),
        };
    },
};
function createBaseAirdrop() {
    return {
        airdropIdentifier: '',
        chainId: '',
        airdropStartTime: Timestamp.fromPartial({}),
        airdropDuration: Duration.fromPartial({}),
        claimDenom: '',
        distributorAddress: '',
        claimedSoFar: '',
        autopilotEnabled: false,
    };
}
export const Airdrop = {
    typeUrl: '/stride.claim.Airdrop',
    encode(message, writer = BinaryWriter.create()) {
        if (message.airdropIdentifier !== '') {
            writer.uint32(10).string(message.airdropIdentifier);
        }
        if (message.chainId !== '') {
            writer.uint32(58).string(message.chainId);
        }
        if (message.airdropStartTime !== undefined) {
            Timestamp.encode(message.airdropStartTime, writer.uint32(18).fork()).ldelim();
        }
        if (message.airdropDuration !== undefined) {
            Duration.encode(message.airdropDuration, writer.uint32(26).fork()).ldelim();
        }
        if (message.claimDenom !== '') {
            writer.uint32(34).string(message.claimDenom);
        }
        if (message.distributorAddress !== '') {
            writer.uint32(42).string(message.distributorAddress);
        }
        if (message.claimedSoFar !== '') {
            writer.uint32(50).string(message.claimedSoFar);
        }
        if (message.autopilotEnabled === true) {
            writer.uint32(64).bool(message.autopilotEnabled);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAirdrop();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.airdropIdentifier = reader.string();
                    break;
                case 7:
                    message.chainId = reader.string();
                    break;
                case 2:
                    message.airdropStartTime = Timestamp.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.airdropDuration = Duration.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.claimDenom = reader.string();
                    break;
                case 5:
                    message.distributorAddress = reader.string();
                    break;
                case 6:
                    message.claimedSoFar = reader.string();
                    break;
                case 8:
                    message.autopilotEnabled = reader.bool();
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
            chainId: isSet(object.chainId) ? String(object.chainId) : '',
            airdropStartTime: isSet(object.airdropStartTime)
                ? fromJsonTimestamp(object.airdropStartTime)
                : undefined,
            airdropDuration: isSet(object.airdropDuration)
                ? Duration.fromJSON(object.airdropDuration)
                : undefined,
            claimDenom: isSet(object.claimDenom) ? String(object.claimDenom) : '',
            distributorAddress: isSet(object.distributorAddress)
                ? String(object.distributorAddress)
                : '',
            claimedSoFar: isSet(object.claimedSoFar)
                ? String(object.claimedSoFar)
                : '',
            autopilotEnabled: isSet(object.autopilotEnabled)
                ? Boolean(object.autopilotEnabled)
                : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.airdropIdentifier !== undefined &&
            (obj.airdropIdentifier = message.airdropIdentifier);
        message.chainId !== undefined && (obj.chainId = message.chainId);
        message.airdropStartTime !== undefined &&
            (obj.airdropStartTime = fromTimestamp(message.airdropStartTime).toISOString());
        message.airdropDuration !== undefined &&
            (obj.airdropDuration = message.airdropDuration
                ? Duration.toJSON(message.airdropDuration)
                : undefined);
        message.claimDenom !== undefined && (obj.claimDenom = message.claimDenom);
        message.distributorAddress !== undefined &&
            (obj.distributorAddress = message.distributorAddress);
        message.claimedSoFar !== undefined &&
            (obj.claimedSoFar = message.claimedSoFar);
        message.autopilotEnabled !== undefined &&
            (obj.autopilotEnabled = message.autopilotEnabled);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseAirdrop();
        message.airdropIdentifier = object.airdropIdentifier ?? '';
        message.chainId = object.chainId ?? '';
        message.airdropStartTime =
            object.airdropStartTime !== undefined && object.airdropStartTime !== null
                ? Timestamp.fromPartial(object.airdropStartTime)
                : undefined;
        message.airdropDuration =
            object.airdropDuration !== undefined && object.airdropDuration !== null
                ? Duration.fromPartial(object.airdropDuration)
                : undefined;
        message.claimDenom = object.claimDenom ?? '';
        message.distributorAddress = object.distributorAddress ?? '';
        message.claimedSoFar = object.claimedSoFar ?? '';
        message.autopilotEnabled = object.autopilotEnabled ?? false;
        return message;
    },
    fromProtoMsg(message) {
        return Airdrop.decode(message.value);
    },
    toProto(message) {
        return Airdrop.encode(message).finish();
    },
    toProtoMsg(message) {
        return {
            typeUrl: '/stride.claim.Airdrop',
            value: Airdrop.encode(message).finish(),
        };
    },
};
//# sourceMappingURL=params.js.map