import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
export interface EpochTracker {
    epochIdentifier: string;
    epochNumber: bigint;
    nextEpochStartTime: bigint;
    duration: bigint;
}
export interface EpochTrackerProtoMsg {
    typeUrl: '/stride.stakeibc.EpochTracker';
    value: Uint8Array;
}
export interface EpochTrackerSDKType {
    epoch_identifier: string;
    epoch_number: bigint;
    next_epoch_start_time: bigint;
    duration: bigint;
}
export declare const EpochTracker: {
    typeUrl: string;
    encode(message: EpochTracker, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): EpochTracker;
    fromJSON(object: any): EpochTracker;
    toJSON(message: EpochTracker): JsonSafe<EpochTracker>;
    fromPartial(object: Partial<EpochTracker>): EpochTracker;
    fromProtoMsg(message: EpochTrackerProtoMsg): EpochTracker;
    toProto(message: EpochTracker): Uint8Array;
    toProtoMsg(message: EpochTracker): EpochTrackerProtoMsg;
};
