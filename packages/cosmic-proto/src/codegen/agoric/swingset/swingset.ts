//@ts-nocheck
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
import { encodeBase64 as bytesFromBase64 } from '@endo/base64';
import { decodeBase64 as base64FromBytes } from '@endo/base64';
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
function createBaseCoreEvalProposal(): CoreEvalProposal {
  return {
    title: '',
    description: '',
    evals: [],
  };
}
export const CoreEvalProposal = {
  typeUrl: '/agoric.swingset.CoreEvalProposal',
  encode(
    message: CoreEvalProposal,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.title !== '') {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== '') {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.evals) {
      CoreEval.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CoreEvalProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoreEvalProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.evals.push(CoreEval.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CoreEvalProposal {
    return {
      title: isSet(object.title) ? String(object.title) : '',
      description: isSet(object.description) ? String(object.description) : '',
      evals: Array.isArray(object?.evals)
        ? object.evals.map((e: any) => CoreEval.fromJSON(e))
        : [],
    };
  },
  toJSON(message: CoreEvalProposal): JsonSafe<CoreEvalProposal> {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined &&
      (obj.description = message.description);
    if (message.evals) {
      obj.evals = message.evals.map(e => (e ? CoreEval.toJSON(e) : undefined));
    } else {
      obj.evals = [];
    }
    return obj;
  },
  fromPartial(object: Partial<CoreEvalProposal>): CoreEvalProposal {
    const message = createBaseCoreEvalProposal();
    message.title = object.title ?? '';
    message.description = object.description ?? '';
    message.evals = object.evals?.map(e => CoreEval.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: CoreEvalProposalProtoMsg): CoreEvalProposal {
    return CoreEvalProposal.decode(message.value);
  },
  toProto(message: CoreEvalProposal): Uint8Array {
    return CoreEvalProposal.encode(message).finish();
  },
  toProtoMsg(message: CoreEvalProposal): CoreEvalProposalProtoMsg {
    return {
      typeUrl: '/agoric.swingset.CoreEvalProposal',
      value: CoreEvalProposal.encode(message).finish(),
    };
  },
};
function createBaseCoreEval(): CoreEval {
  return {
    jsonPermits: '',
    jsCode: '',
  };
}
export const CoreEval = {
  typeUrl: '/agoric.swingset.CoreEval',
  encode(
    message: CoreEval,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.jsonPermits !== '') {
      writer.uint32(10).string(message.jsonPermits);
    }
    if (message.jsCode !== '') {
      writer.uint32(18).string(message.jsCode);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CoreEval {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoreEval();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.jsonPermits = reader.string();
          break;
        case 2:
          message.jsCode = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CoreEval {
    return {
      jsonPermits: isSet(object.jsonPermits) ? String(object.jsonPermits) : '',
      jsCode: isSet(object.jsCode) ? String(object.jsCode) : '',
    };
  },
  toJSON(message: CoreEval): JsonSafe<CoreEval> {
    const obj: any = {};
    message.jsonPermits !== undefined &&
      (obj.jsonPermits = message.jsonPermits);
    message.jsCode !== undefined && (obj.jsCode = message.jsCode);
    return obj;
  },
  fromPartial(object: Partial<CoreEval>): CoreEval {
    const message = createBaseCoreEval();
    message.jsonPermits = object.jsonPermits ?? '';
    message.jsCode = object.jsCode ?? '';
    return message;
  },
  fromProtoMsg(message: CoreEvalProtoMsg): CoreEval {
    return CoreEval.decode(message.value);
  },
  toProto(message: CoreEval): Uint8Array {
    return CoreEval.encode(message).finish();
  },
  toProtoMsg(message: CoreEval): CoreEvalProtoMsg {
    return {
      typeUrl: '/agoric.swingset.CoreEval',
      value: CoreEval.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    beansPerUnit: [],
    feeUnitPrice: [],
    bootstrapVatConfig: '',
    powerFlagFees: [],
    queueMax: [],
    vatCleanupBudget: [],
  };
}
export const Params = {
  typeUrl: '/agoric.swingset.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.beansPerUnit) {
      StringBeans.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.feeUnitPrice) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.bootstrapVatConfig !== '') {
      writer.uint32(26).string(message.bootstrapVatConfig);
    }
    for (const v of message.powerFlagFees) {
      PowerFlagFee.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.queueMax) {
      QueueSize.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.vatCleanupBudget) {
      UintMapEntry.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.beansPerUnit.push(
            StringBeans.decode(reader, reader.uint32()),
          );
          break;
        case 2:
          message.feeUnitPrice.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.bootstrapVatConfig = reader.string();
          break;
        case 4:
          message.powerFlagFees.push(
            PowerFlagFee.decode(reader, reader.uint32()),
          );
          break;
        case 5:
          message.queueMax.push(QueueSize.decode(reader, reader.uint32()));
          break;
        case 6:
          message.vatCleanupBudget.push(
            UintMapEntry.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Params {
    return {
      beansPerUnit: Array.isArray(object?.beansPerUnit)
        ? object.beansPerUnit.map((e: any) => StringBeans.fromJSON(e))
        : [],
      feeUnitPrice: Array.isArray(object?.feeUnitPrice)
        ? object.feeUnitPrice.map((e: any) => Coin.fromJSON(e))
        : [],
      bootstrapVatConfig: isSet(object.bootstrapVatConfig)
        ? String(object.bootstrapVatConfig)
        : '',
      powerFlagFees: Array.isArray(object?.powerFlagFees)
        ? object.powerFlagFees.map((e: any) => PowerFlagFee.fromJSON(e))
        : [],
      queueMax: Array.isArray(object?.queueMax)
        ? object.queueMax.map((e: any) => QueueSize.fromJSON(e))
        : [],
      vatCleanupBudget: Array.isArray(object?.vatCleanupBudget)
        ? object.vatCleanupBudget.map((e: any) => UintMapEntry.fromJSON(e))
        : [],
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    if (message.beansPerUnit) {
      obj.beansPerUnit = message.beansPerUnit.map(e =>
        e ? StringBeans.toJSON(e) : undefined,
      );
    } else {
      obj.beansPerUnit = [];
    }
    if (message.feeUnitPrice) {
      obj.feeUnitPrice = message.feeUnitPrice.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.feeUnitPrice = [];
    }
    message.bootstrapVatConfig !== undefined &&
      (obj.bootstrapVatConfig = message.bootstrapVatConfig);
    if (message.powerFlagFees) {
      obj.powerFlagFees = message.powerFlagFees.map(e =>
        e ? PowerFlagFee.toJSON(e) : undefined,
      );
    } else {
      obj.powerFlagFees = [];
    }
    if (message.queueMax) {
      obj.queueMax = message.queueMax.map(e =>
        e ? QueueSize.toJSON(e) : undefined,
      );
    } else {
      obj.queueMax = [];
    }
    if (message.vatCleanupBudget) {
      obj.vatCleanupBudget = message.vatCleanupBudget.map(e =>
        e ? UintMapEntry.toJSON(e) : undefined,
      );
    } else {
      obj.vatCleanupBudget = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.beansPerUnit =
      object.beansPerUnit?.map(e => StringBeans.fromPartial(e)) || [];
    message.feeUnitPrice =
      object.feeUnitPrice?.map(e => Coin.fromPartial(e)) || [];
    message.bootstrapVatConfig = object.bootstrapVatConfig ?? '';
    message.powerFlagFees =
      object.powerFlagFees?.map(e => PowerFlagFee.fromPartial(e)) || [];
    message.queueMax =
      object.queueMax?.map(e => QueueSize.fromPartial(e)) || [];
    message.vatCleanupBudget =
      object.vatCleanupBudget?.map(e => UintMapEntry.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: '/agoric.swingset.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseState(): State {
  return {
    queueAllowed: [],
  };
}
export const State = {
  typeUrl: '/agoric.swingset.State',
  encode(
    message: State,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.queueAllowed) {
      QueueSize.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): State {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.queueAllowed.push(QueueSize.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): State {
    return {
      queueAllowed: Array.isArray(object?.queueAllowed)
        ? object.queueAllowed.map((e: any) => QueueSize.fromJSON(e))
        : [],
    };
  },
  toJSON(message: State): JsonSafe<State> {
    const obj: any = {};
    if (message.queueAllowed) {
      obj.queueAllowed = message.queueAllowed.map(e =>
        e ? QueueSize.toJSON(e) : undefined,
      );
    } else {
      obj.queueAllowed = [];
    }
    return obj;
  },
  fromPartial(object: Partial<State>): State {
    const message = createBaseState();
    message.queueAllowed =
      object.queueAllowed?.map(e => QueueSize.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: StateProtoMsg): State {
    return State.decode(message.value);
  },
  toProto(message: State): Uint8Array {
    return State.encode(message).finish();
  },
  toProtoMsg(message: State): StateProtoMsg {
    return {
      typeUrl: '/agoric.swingset.State',
      value: State.encode(message).finish(),
    };
  },
};
function createBaseStringBeans(): StringBeans {
  return {
    key: '',
    beans: '',
  };
}
export const StringBeans = {
  typeUrl: '/agoric.swingset.StringBeans',
  encode(
    message: StringBeans,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.beans !== '') {
      writer.uint32(18).string(message.beans);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): StringBeans {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStringBeans();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.beans = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): StringBeans {
    return {
      key: isSet(object.key) ? String(object.key) : '',
      beans: isSet(object.beans) ? String(object.beans) : '',
    };
  },
  toJSON(message: StringBeans): JsonSafe<StringBeans> {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.beans !== undefined && (obj.beans = message.beans);
    return obj;
  },
  fromPartial(object: Partial<StringBeans>): StringBeans {
    const message = createBaseStringBeans();
    message.key = object.key ?? '';
    message.beans = object.beans ?? '';
    return message;
  },
  fromProtoMsg(message: StringBeansProtoMsg): StringBeans {
    return StringBeans.decode(message.value);
  },
  toProto(message: StringBeans): Uint8Array {
    return StringBeans.encode(message).finish();
  },
  toProtoMsg(message: StringBeans): StringBeansProtoMsg {
    return {
      typeUrl: '/agoric.swingset.StringBeans',
      value: StringBeans.encode(message).finish(),
    };
  },
};
function createBasePowerFlagFee(): PowerFlagFee {
  return {
    powerFlag: '',
    fee: [],
  };
}
export const PowerFlagFee = {
  typeUrl: '/agoric.swingset.PowerFlagFee',
  encode(
    message: PowerFlagFee,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.powerFlag !== '') {
      writer.uint32(10).string(message.powerFlag);
    }
    for (const v of message.fee) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PowerFlagFee {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePowerFlagFee();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.powerFlag = reader.string();
          break;
        case 2:
          message.fee.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PowerFlagFee {
    return {
      powerFlag: isSet(object.powerFlag) ? String(object.powerFlag) : '',
      fee: Array.isArray(object?.fee)
        ? object.fee.map((e: any) => Coin.fromJSON(e))
        : [],
    };
  },
  toJSON(message: PowerFlagFee): JsonSafe<PowerFlagFee> {
    const obj: any = {};
    message.powerFlag !== undefined && (obj.powerFlag = message.powerFlag);
    if (message.fee) {
      obj.fee = message.fee.map(e => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.fee = [];
    }
    return obj;
  },
  fromPartial(object: Partial<PowerFlagFee>): PowerFlagFee {
    const message = createBasePowerFlagFee();
    message.powerFlag = object.powerFlag ?? '';
    message.fee = object.fee?.map(e => Coin.fromPartial(e)) || [];
    return message;
  },
  fromProtoMsg(message: PowerFlagFeeProtoMsg): PowerFlagFee {
    return PowerFlagFee.decode(message.value);
  },
  toProto(message: PowerFlagFee): Uint8Array {
    return PowerFlagFee.encode(message).finish();
  },
  toProtoMsg(message: PowerFlagFee): PowerFlagFeeProtoMsg {
    return {
      typeUrl: '/agoric.swingset.PowerFlagFee',
      value: PowerFlagFee.encode(message).finish(),
    };
  },
};
function createBaseQueueSize(): QueueSize {
  return {
    key: '',
    size: 0,
  };
}
export const QueueSize = {
  typeUrl: '/agoric.swingset.QueueSize',
  encode(
    message: QueueSize,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.size !== 0) {
      writer.uint32(16).int32(message.size);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): QueueSize {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueueSize();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.size = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): QueueSize {
    return {
      key: isSet(object.key) ? String(object.key) : '',
      size: isSet(object.size) ? Number(object.size) : 0,
    };
  },
  toJSON(message: QueueSize): JsonSafe<QueueSize> {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.size !== undefined && (obj.size = Math.round(message.size));
    return obj;
  },
  fromPartial(object: Partial<QueueSize>): QueueSize {
    const message = createBaseQueueSize();
    message.key = object.key ?? '';
    message.size = object.size ?? 0;
    return message;
  },
  fromProtoMsg(message: QueueSizeProtoMsg): QueueSize {
    return QueueSize.decode(message.value);
  },
  toProto(message: QueueSize): Uint8Array {
    return QueueSize.encode(message).finish();
  },
  toProtoMsg(message: QueueSize): QueueSizeProtoMsg {
    return {
      typeUrl: '/agoric.swingset.QueueSize',
      value: QueueSize.encode(message).finish(),
    };
  },
};
function createBaseUintMapEntry(): UintMapEntry {
  return {
    key: '',
    value: '',
  };
}
export const UintMapEntry = {
  typeUrl: '/agoric.swingset.UintMapEntry',
  encode(
    message: UintMapEntry,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): UintMapEntry {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUintMapEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): UintMapEntry {
    return {
      key: isSet(object.key) ? String(object.key) : '',
      value: isSet(object.value) ? String(object.value) : '',
    };
  },
  toJSON(message: UintMapEntry): JsonSafe<UintMapEntry> {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },
  fromPartial(object: Partial<UintMapEntry>): UintMapEntry {
    const message = createBaseUintMapEntry();
    message.key = object.key ?? '';
    message.value = object.value ?? '';
    return message;
  },
  fromProtoMsg(message: UintMapEntryProtoMsg): UintMapEntry {
    return UintMapEntry.decode(message.value);
  },
  toProto(message: UintMapEntry): Uint8Array {
    return UintMapEntry.encode(message).finish();
  },
  toProtoMsg(message: UintMapEntry): UintMapEntryProtoMsg {
    return {
      typeUrl: '/agoric.swingset.UintMapEntry',
      value: UintMapEntry.encode(message).finish(),
    };
  },
};
function createBaseEgress(): Egress {
  return {
    nickname: '',
    peer: new Uint8Array(),
    powerFlags: [],
  };
}
export const Egress = {
  typeUrl: '/agoric.swingset.Egress',
  encode(
    message: Egress,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.nickname !== '') {
      writer.uint32(10).string(message.nickname);
    }
    if (message.peer.length !== 0) {
      writer.uint32(18).bytes(message.peer);
    }
    for (const v of message.powerFlags) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Egress {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEgress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nickname = reader.string();
          break;
        case 2:
          message.peer = reader.bytes();
          break;
        case 3:
          message.powerFlags.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Egress {
    return {
      nickname: isSet(object.nickname) ? String(object.nickname) : '',
      peer: isSet(object.peer)
        ? bytesFromBase64(object.peer)
        : new Uint8Array(),
      powerFlags: Array.isArray(object?.powerFlags)
        ? object.powerFlags.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: Egress): JsonSafe<Egress> {
    const obj: any = {};
    message.nickname !== undefined && (obj.nickname = message.nickname);
    message.peer !== undefined &&
      (obj.peer = base64FromBytes(
        message.peer !== undefined ? message.peer : new Uint8Array(),
      ));
    if (message.powerFlags) {
      obj.powerFlags = message.powerFlags.map(e => e);
    } else {
      obj.powerFlags = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Egress>): Egress {
    const message = createBaseEgress();
    message.nickname = object.nickname ?? '';
    message.peer = object.peer ?? new Uint8Array();
    message.powerFlags = object.powerFlags?.map(e => e) || [];
    return message;
  },
  fromProtoMsg(message: EgressProtoMsg): Egress {
    return Egress.decode(message.value);
  },
  toProto(message: Egress): Uint8Array {
    return Egress.encode(message).finish();
  },
  toProtoMsg(message: Egress): EgressProtoMsg {
    return {
      typeUrl: '/agoric.swingset.Egress',
      value: Egress.encode(message).finish(),
    };
  },
};
function createBaseSwingStoreArtifact(): SwingStoreArtifact {
  return {
    name: '',
    data: new Uint8Array(),
  };
}
export const SwingStoreArtifact = {
  typeUrl: '/agoric.swingset.SwingStoreArtifact',
  encode(
    message: SwingStoreArtifact,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): SwingStoreArtifact {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwingStoreArtifact();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SwingStoreArtifact {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      data: isSet(object.data)
        ? bytesFromBase64(object.data)
        : new Uint8Array(),
    };
  },
  toJSON(message: SwingStoreArtifact): JsonSafe<SwingStoreArtifact> {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.data !== undefined &&
      (obj.data = base64FromBytes(
        message.data !== undefined ? message.data : new Uint8Array(),
      ));
    return obj;
  },
  fromPartial(object: Partial<SwingStoreArtifact>): SwingStoreArtifact {
    const message = createBaseSwingStoreArtifact();
    message.name = object.name ?? '';
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromProtoMsg(message: SwingStoreArtifactProtoMsg): SwingStoreArtifact {
    return SwingStoreArtifact.decode(message.value);
  },
  toProto(message: SwingStoreArtifact): Uint8Array {
    return SwingStoreArtifact.encode(message).finish();
  },
  toProtoMsg(message: SwingStoreArtifact): SwingStoreArtifactProtoMsg {
    return {
      typeUrl: '/agoric.swingset.SwingStoreArtifact',
      value: SwingStoreArtifact.encode(message).finish(),
    };
  },
};
