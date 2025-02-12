import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * CoreEvalProposal is a gov Content type for evaluating code in the SwingSet
 * core.
 * See `bridgeCoreEval` in agoric-sdk packages/vats/src/core/chain-behaviors.js.
 */
export interface CoreEvalProposal {
    title: string;
    description: string;
    /**
     * Although evals are sequential, they may run concurrently, since they each
     * can return a Promise.
     */
    evals: CoreEval[];
}
export interface CoreEvalProposalProtoMsg {
    typeUrl: '/agoric.swingset.CoreEvalProposal';
    value: Uint8Array;
}
/**
 * CoreEvalProposal is a gov Content type for evaluating code in the SwingSet
 * core.
 * See `bridgeCoreEval` in agoric-sdk packages/vats/src/core/chain-behaviors.js.
 */
export interface CoreEvalProposalSDKType {
    title: string;
    description: string;
    evals: CoreEvalSDKType[];
}
/**
 * CoreEval defines an individual SwingSet core evaluation, for use in
 * CoreEvalProposal.
 */
export interface CoreEval {
    /**
     * Grant these JSON-stringified core bootstrap permits to the jsCode, as the
     * `powers` endowment.
     */
    jsonPermits: string;
    /**
     * Evaluate this JavaScript code in a Compartment endowed with `powers` as
     * well as some powerless helpers.
     */
    jsCode: string;
}
export interface CoreEvalProtoMsg {
    typeUrl: '/agoric.swingset.CoreEval';
    value: Uint8Array;
}
/**
 * CoreEval defines an individual SwingSet core evaluation, for use in
 * CoreEvalProposal.
 */
export interface CoreEvalSDKType {
    json_permits: string;
    js_code: string;
}
/** Params are the swingset configuration/governance parameters. */
export interface Params {
    /**
     * Map from unit name to a value in SwingSet "beans".
     * Must not be negative.
     *
     * These values are used by SwingSet to normalize named per-resource charges
     * (maybe rent) in a single Nat usage unit, the "bean".
     *
     * There is no required order to this list of entries, but all the chain
     * nodes must all serialize and deserialize the existing order without
     * permuting it.
     */
    beansPerUnit: StringBeans[];
    /**
     * The price in Coins per the unit named "fee".  This value is used by
     * cosmic-swingset JS code to decide how many tokens to charge.
     *
     * cost = beans_used * fee_unit_price / beans_per_unit["fee"]
     */
    feeUnitPrice: Coin[];
    /**
     * The SwingSet bootstrap vat configuration file.  Not usefully modifiable
     * via governance as it is only referenced by the chain's initial
     * construction.
     */
    bootstrapVatConfig: string;
    /**
     * If the provision submitter doesn't hold a provisionpass, their requested
     * power flags are looked up in this fee menu (first match wins) and the sum
     * is charged.  If any power flag is not found in this menu, the request is
     * rejected.
     */
    powerFlagFees: PowerFlagFee[];
    /**
     * Maximum sizes for queues.
     * These values are used by SwingSet to compute how many messages should be
     * accepted in a block.
     *
     * There is no required order to this list of entries, but all the chain
     * nodes must all serialize and deserialize the existing order without
     * permuting it.
     */
    queueMax: QueueSize[];
    /**
     * Vat cleanup budget values.
     * These values are used by SwingSet to control the pace of removing data
     * associated with a terminated vat as described at
     * https://github.com/Agoric/agoric-sdk/blob/master/packages/SwingSet/docs/run-policy.md#terminated-vat-cleanup
     *
     * There is no required order to this list of entries, but all the chain
     * nodes must all serialize and deserialize the existing order without
     * permuting it.
     */
    vatCleanupBudget: UintMapEntry[];
}
export interface ParamsProtoMsg {
    typeUrl: '/agoric.swingset.Params';
    value: Uint8Array;
}
/** Params are the swingset configuration/governance parameters. */
export interface ParamsSDKType {
    beans_per_unit: StringBeansSDKType[];
    fee_unit_price: CoinSDKType[];
    bootstrap_vat_config: string;
    power_flag_fees: PowerFlagFeeSDKType[];
    queue_max: QueueSizeSDKType[];
    vat_cleanup_budget: UintMapEntrySDKType[];
}
/** The current state of the module. */
export interface State {
    /**
     * The allowed number of items to add to queues, as determined by SwingSet.
     * Transactions which attempt to enqueue more should be rejected.
     */
    queueAllowed: QueueSize[];
}
export interface StateProtoMsg {
    typeUrl: '/agoric.swingset.State';
    value: Uint8Array;
}
/** The current state of the module. */
export interface StateSDKType {
    queue_allowed: QueueSizeSDKType[];
}
/** Map element of a string key to a Nat bean count. */
export interface StringBeans {
    /** What the beans are for. */
    key: string;
    /** The actual bean value. */
    beans: string;
}
export interface StringBeansProtoMsg {
    typeUrl: '/agoric.swingset.StringBeans';
    value: Uint8Array;
}
/** Map element of a string key to a Nat bean count. */
export interface StringBeansSDKType {
    key: string;
    beans: string;
}
/** Map a provisioning power flag to its corresponding fee. */
export interface PowerFlagFee {
    powerFlag: string;
    fee: Coin[];
}
export interface PowerFlagFeeProtoMsg {
    typeUrl: '/agoric.swingset.PowerFlagFee';
    value: Uint8Array;
}
/** Map a provisioning power flag to its corresponding fee. */
export interface PowerFlagFeeSDKType {
    power_flag: string;
    fee: CoinSDKType[];
}
/**
 * Map element of a string key to a size.
 * TODO: Replace with UintMapEntry?
 */
export interface QueueSize {
    /** What the size is for. */
    key: string;
    /** The actual size value. */
    size: number;
}
export interface QueueSizeProtoMsg {
    typeUrl: '/agoric.swingset.QueueSize';
    value: Uint8Array;
}
/**
 * Map element of a string key to a size.
 * TODO: Replace with UintMapEntry?
 */
export interface QueueSizeSDKType {
    key: string;
    size: number;
}
/**
 * Map element of a string key to an unsigned integer.
 * The value uses cosmos-sdk Uint rather than a native Go type to ensure that
 * zeroes survive "omitempty" JSON serialization.
 */
export interface UintMapEntry {
    key: string;
    value: string;
}
export interface UintMapEntryProtoMsg {
    typeUrl: '/agoric.swingset.UintMapEntry';
    value: Uint8Array;
}
/**
 * Map element of a string key to an unsigned integer.
 * The value uses cosmos-sdk Uint rather than a native Go type to ensure that
 * zeroes survive "omitempty" JSON serialization.
 */
export interface UintMapEntrySDKType {
    key: string;
    value: string;
}
/** Egress is the format for a swingset egress. */
export interface Egress {
    nickname: string;
    peer: Uint8Array;
    /** TODO: Remove these power flags as they are deprecated and have no effect. */
    powerFlags: string[];
}
export interface EgressProtoMsg {
    typeUrl: '/agoric.swingset.Egress';
    value: Uint8Array;
}
/** Egress is the format for a swingset egress. */
export interface EgressSDKType {
    nickname: string;
    peer: Uint8Array;
    power_flags: string[];
}
/**
 * SwingStoreArtifact encodes an artifact of a swing-store export.
 * Artifacts may be stored or transmitted in any order. Most handlers do
 * maintain the artifact order from their original source as an effect of how
 * they handle the artifacts.
 */
export interface SwingStoreArtifact {
    name: string;
    data: Uint8Array;
}
export interface SwingStoreArtifactProtoMsg {
    typeUrl: '/agoric.swingset.SwingStoreArtifact';
    value: Uint8Array;
}
/**
 * SwingStoreArtifact encodes an artifact of a swing-store export.
 * Artifacts may be stored or transmitted in any order. Most handlers do
 * maintain the artifact order from their original source as an effect of how
 * they handle the artifacts.
 */
export interface SwingStoreArtifactSDKType {
    name: string;
    data: Uint8Array;
}
export declare const CoreEvalProposal: {
    typeUrl: string;
    encode(message: CoreEvalProposal, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CoreEvalProposal;
    fromJSON(object: any): CoreEvalProposal;
    toJSON(message: CoreEvalProposal): JsonSafe<CoreEvalProposal>;
    fromPartial(object: Partial<CoreEvalProposal>): CoreEvalProposal;
    fromProtoMsg(message: CoreEvalProposalProtoMsg): CoreEvalProposal;
    toProto(message: CoreEvalProposal): Uint8Array;
    toProtoMsg(message: CoreEvalProposal): CoreEvalProposalProtoMsg;
};
export declare const CoreEval: {
    typeUrl: string;
    encode(message: CoreEval, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): CoreEval;
    fromJSON(object: any): CoreEval;
    toJSON(message: CoreEval): JsonSafe<CoreEval>;
    fromPartial(object: Partial<CoreEval>): CoreEval;
    fromProtoMsg(message: CoreEvalProtoMsg): CoreEval;
    toProto(message: CoreEval): Uint8Array;
    toProtoMsg(message: CoreEval): CoreEvalProtoMsg;
};
export declare const Params: {
    typeUrl: string;
    encode(message: Params, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Params;
    fromJSON(object: any): Params;
    toJSON(message: Params): JsonSafe<Params>;
    fromPartial(object: Partial<Params>): Params;
    fromProtoMsg(message: ParamsProtoMsg): Params;
    toProto(message: Params): Uint8Array;
    toProtoMsg(message: Params): ParamsProtoMsg;
};
export declare const State: {
    typeUrl: string;
    encode(message: State, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): State;
    fromJSON(object: any): State;
    toJSON(message: State): JsonSafe<State>;
    fromPartial(object: Partial<State>): State;
    fromProtoMsg(message: StateProtoMsg): State;
    toProto(message: State): Uint8Array;
    toProtoMsg(message: State): StateProtoMsg;
};
export declare const StringBeans: {
    typeUrl: string;
    encode(message: StringBeans, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): StringBeans;
    fromJSON(object: any): StringBeans;
    toJSON(message: StringBeans): JsonSafe<StringBeans>;
    fromPartial(object: Partial<StringBeans>): StringBeans;
    fromProtoMsg(message: StringBeansProtoMsg): StringBeans;
    toProto(message: StringBeans): Uint8Array;
    toProtoMsg(message: StringBeans): StringBeansProtoMsg;
};
export declare const PowerFlagFee: {
    typeUrl: string;
    encode(message: PowerFlagFee, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): PowerFlagFee;
    fromJSON(object: any): PowerFlagFee;
    toJSON(message: PowerFlagFee): JsonSafe<PowerFlagFee>;
    fromPartial(object: Partial<PowerFlagFee>): PowerFlagFee;
    fromProtoMsg(message: PowerFlagFeeProtoMsg): PowerFlagFee;
    toProto(message: PowerFlagFee): Uint8Array;
    toProtoMsg(message: PowerFlagFee): PowerFlagFeeProtoMsg;
};
export declare const QueueSize: {
    typeUrl: string;
    encode(message: QueueSize, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): QueueSize;
    fromJSON(object: any): QueueSize;
    toJSON(message: QueueSize): JsonSafe<QueueSize>;
    fromPartial(object: Partial<QueueSize>): QueueSize;
    fromProtoMsg(message: QueueSizeProtoMsg): QueueSize;
    toProto(message: QueueSize): Uint8Array;
    toProtoMsg(message: QueueSize): QueueSizeProtoMsg;
};
export declare const UintMapEntry: {
    typeUrl: string;
    encode(message: UintMapEntry, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): UintMapEntry;
    fromJSON(object: any): UintMapEntry;
    toJSON(message: UintMapEntry): JsonSafe<UintMapEntry>;
    fromPartial(object: Partial<UintMapEntry>): UintMapEntry;
    fromProtoMsg(message: UintMapEntryProtoMsg): UintMapEntry;
    toProto(message: UintMapEntry): Uint8Array;
    toProtoMsg(message: UintMapEntry): UintMapEntryProtoMsg;
};
export declare const Egress: {
    typeUrl: string;
    encode(message: Egress, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): Egress;
    fromJSON(object: any): Egress;
    toJSON(message: Egress): JsonSafe<Egress>;
    fromPartial(object: Partial<Egress>): Egress;
    fromProtoMsg(message: EgressProtoMsg): Egress;
    toProto(message: Egress): Uint8Array;
    toProtoMsg(message: Egress): EgressProtoMsg;
};
export declare const SwingStoreArtifact: {
    typeUrl: string;
    encode(message: SwingStoreArtifact, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): SwingStoreArtifact;
    fromJSON(object: any): SwingStoreArtifact;
    toJSON(message: SwingStoreArtifact): JsonSafe<SwingStoreArtifact>;
    fromPartial(object: Partial<SwingStoreArtifact>): SwingStoreArtifact;
    fromProtoMsg(message: SwingStoreArtifactProtoMsg): SwingStoreArtifact;
    toProto(message: SwingStoreArtifact): Uint8Array;
    toProtoMsg(message: SwingStoreArtifact): SwingStoreArtifactProtoMsg;
};
