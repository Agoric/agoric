//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/**
 * Params defines the parameters for the module.
 * next id: 20
 */
export interface Params {
  /** define epoch lengths, in stride_epochs */
  rewardsInterval: bigint;
  delegateInterval: bigint;
  depositInterval: bigint;
  redemptionRateInterval: bigint;
  strideCommission: bigint;
  reinvestInterval: bigint;
  icaTimeoutNanos: bigint;
  bufferSize: bigint;
  ibcTimeoutBlocks: bigint;
  feeTransferTimeoutNanos: bigint;
  maxStakeIcaCallsPerEpoch: bigint;
  defaultMinRedemptionRateThreshold: bigint;
  defaultMaxRedemptionRateThreshold: bigint;
  ibcTransferTimeoutNanos: bigint;
  validatorSlashQueryThreshold: bigint;
  validatorWeightCap: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/stride.stakeibc.Params';
  value: Uint8Array;
}
/**
 * Params defines the parameters for the module.
 * next id: 20
 */
export interface ParamsSDKType {
  rewards_interval: bigint;
  delegate_interval: bigint;
  deposit_interval: bigint;
  redemption_rate_interval: bigint;
  stride_commission: bigint;
  reinvest_interval: bigint;
  ica_timeout_nanos: bigint;
  buffer_size: bigint;
  ibc_timeout_blocks: bigint;
  fee_transfer_timeout_nanos: bigint;
  max_stake_ica_calls_per_epoch: bigint;
  default_min_redemption_rate_threshold: bigint;
  default_max_redemption_rate_threshold: bigint;
  ibc_transfer_timeout_nanos: bigint;
  validator_slash_query_threshold: bigint;
  validator_weight_cap: bigint;
}
function createBaseParams(): Params {
  return {
    rewardsInterval: BigInt(0),
    delegateInterval: BigInt(0),
    depositInterval: BigInt(0),
    redemptionRateInterval: BigInt(0),
    strideCommission: BigInt(0),
    reinvestInterval: BigInt(0),
    icaTimeoutNanos: BigInt(0),
    bufferSize: BigInt(0),
    ibcTimeoutBlocks: BigInt(0),
    feeTransferTimeoutNanos: BigInt(0),
    maxStakeIcaCallsPerEpoch: BigInt(0),
    defaultMinRedemptionRateThreshold: BigInt(0),
    defaultMaxRedemptionRateThreshold: BigInt(0),
    ibcTransferTimeoutNanos: BigInt(0),
    validatorSlashQueryThreshold: BigInt(0),
    validatorWeightCap: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/stride.stakeibc.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rewardsInterval !== BigInt(0)) {
      writer.uint32(8).uint64(message.rewardsInterval);
    }
    if (message.delegateInterval !== BigInt(0)) {
      writer.uint32(48).uint64(message.delegateInterval);
    }
    if (message.depositInterval !== BigInt(0)) {
      writer.uint32(16).uint64(message.depositInterval);
    }
    if (message.redemptionRateInterval !== BigInt(0)) {
      writer.uint32(24).uint64(message.redemptionRateInterval);
    }
    if (message.strideCommission !== BigInt(0)) {
      writer.uint32(32).uint64(message.strideCommission);
    }
    if (message.reinvestInterval !== BigInt(0)) {
      writer.uint32(56).uint64(message.reinvestInterval);
    }
    if (message.icaTimeoutNanos !== BigInt(0)) {
      writer.uint32(72).uint64(message.icaTimeoutNanos);
    }
    if (message.bufferSize !== BigInt(0)) {
      writer.uint32(80).uint64(message.bufferSize);
    }
    if (message.ibcTimeoutBlocks !== BigInt(0)) {
      writer.uint32(88).uint64(message.ibcTimeoutBlocks);
    }
    if (message.feeTransferTimeoutNanos !== BigInt(0)) {
      writer.uint32(96).uint64(message.feeTransferTimeoutNanos);
    }
    if (message.maxStakeIcaCallsPerEpoch !== BigInt(0)) {
      writer.uint32(104).uint64(message.maxStakeIcaCallsPerEpoch);
    }
    if (message.defaultMinRedemptionRateThreshold !== BigInt(0)) {
      writer.uint32(112).uint64(message.defaultMinRedemptionRateThreshold);
    }
    if (message.defaultMaxRedemptionRateThreshold !== BigInt(0)) {
      writer.uint32(120).uint64(message.defaultMaxRedemptionRateThreshold);
    }
    if (message.ibcTransferTimeoutNanos !== BigInt(0)) {
      writer.uint32(128).uint64(message.ibcTransferTimeoutNanos);
    }
    if (message.validatorSlashQueryThreshold !== BigInt(0)) {
      writer.uint32(152).uint64(message.validatorSlashQueryThreshold);
    }
    if (message.validatorWeightCap !== BigInt(0)) {
      writer.uint32(160).uint64(message.validatorWeightCap);
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
          message.rewardsInterval = reader.uint64();
          break;
        case 6:
          message.delegateInterval = reader.uint64();
          break;
        case 2:
          message.depositInterval = reader.uint64();
          break;
        case 3:
          message.redemptionRateInterval = reader.uint64();
          break;
        case 4:
          message.strideCommission = reader.uint64();
          break;
        case 7:
          message.reinvestInterval = reader.uint64();
          break;
        case 9:
          message.icaTimeoutNanos = reader.uint64();
          break;
        case 10:
          message.bufferSize = reader.uint64();
          break;
        case 11:
          message.ibcTimeoutBlocks = reader.uint64();
          break;
        case 12:
          message.feeTransferTimeoutNanos = reader.uint64();
          break;
        case 13:
          message.maxStakeIcaCallsPerEpoch = reader.uint64();
          break;
        case 14:
          message.defaultMinRedemptionRateThreshold = reader.uint64();
          break;
        case 15:
          message.defaultMaxRedemptionRateThreshold = reader.uint64();
          break;
        case 16:
          message.ibcTransferTimeoutNanos = reader.uint64();
          break;
        case 19:
          message.validatorSlashQueryThreshold = reader.uint64();
          break;
        case 20:
          message.validatorWeightCap = reader.uint64();
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
      rewardsInterval: isSet(object.rewardsInterval)
        ? BigInt(object.rewardsInterval.toString())
        : BigInt(0),
      delegateInterval: isSet(object.delegateInterval)
        ? BigInt(object.delegateInterval.toString())
        : BigInt(0),
      depositInterval: isSet(object.depositInterval)
        ? BigInt(object.depositInterval.toString())
        : BigInt(0),
      redemptionRateInterval: isSet(object.redemptionRateInterval)
        ? BigInt(object.redemptionRateInterval.toString())
        : BigInt(0),
      strideCommission: isSet(object.strideCommission)
        ? BigInt(object.strideCommission.toString())
        : BigInt(0),
      reinvestInterval: isSet(object.reinvestInterval)
        ? BigInt(object.reinvestInterval.toString())
        : BigInt(0),
      icaTimeoutNanos: isSet(object.icaTimeoutNanos)
        ? BigInt(object.icaTimeoutNanos.toString())
        : BigInt(0),
      bufferSize: isSet(object.bufferSize)
        ? BigInt(object.bufferSize.toString())
        : BigInt(0),
      ibcTimeoutBlocks: isSet(object.ibcTimeoutBlocks)
        ? BigInt(object.ibcTimeoutBlocks.toString())
        : BigInt(0),
      feeTransferTimeoutNanos: isSet(object.feeTransferTimeoutNanos)
        ? BigInt(object.feeTransferTimeoutNanos.toString())
        : BigInt(0),
      maxStakeIcaCallsPerEpoch: isSet(object.maxStakeIcaCallsPerEpoch)
        ? BigInt(object.maxStakeIcaCallsPerEpoch.toString())
        : BigInt(0),
      defaultMinRedemptionRateThreshold: isSet(
        object.defaultMinRedemptionRateThreshold,
      )
        ? BigInt(object.defaultMinRedemptionRateThreshold.toString())
        : BigInt(0),
      defaultMaxRedemptionRateThreshold: isSet(
        object.defaultMaxRedemptionRateThreshold,
      )
        ? BigInt(object.defaultMaxRedemptionRateThreshold.toString())
        : BigInt(0),
      ibcTransferTimeoutNanos: isSet(object.ibcTransferTimeoutNanos)
        ? BigInt(object.ibcTransferTimeoutNanos.toString())
        : BigInt(0),
      validatorSlashQueryThreshold: isSet(object.validatorSlashQueryThreshold)
        ? BigInt(object.validatorSlashQueryThreshold.toString())
        : BigInt(0),
      validatorWeightCap: isSet(object.validatorWeightCap)
        ? BigInt(object.validatorWeightCap.toString())
        : BigInt(0),
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.rewardsInterval !== undefined &&
      (obj.rewardsInterval = (message.rewardsInterval || BigInt(0)).toString());
    message.delegateInterval !== undefined &&
      (obj.delegateInterval = (
        message.delegateInterval || BigInt(0)
      ).toString());
    message.depositInterval !== undefined &&
      (obj.depositInterval = (message.depositInterval || BigInt(0)).toString());
    message.redemptionRateInterval !== undefined &&
      (obj.redemptionRateInterval = (
        message.redemptionRateInterval || BigInt(0)
      ).toString());
    message.strideCommission !== undefined &&
      (obj.strideCommission = (
        message.strideCommission || BigInt(0)
      ).toString());
    message.reinvestInterval !== undefined &&
      (obj.reinvestInterval = (
        message.reinvestInterval || BigInt(0)
      ).toString());
    message.icaTimeoutNanos !== undefined &&
      (obj.icaTimeoutNanos = (message.icaTimeoutNanos || BigInt(0)).toString());
    message.bufferSize !== undefined &&
      (obj.bufferSize = (message.bufferSize || BigInt(0)).toString());
    message.ibcTimeoutBlocks !== undefined &&
      (obj.ibcTimeoutBlocks = (
        message.ibcTimeoutBlocks || BigInt(0)
      ).toString());
    message.feeTransferTimeoutNanos !== undefined &&
      (obj.feeTransferTimeoutNanos = (
        message.feeTransferTimeoutNanos || BigInt(0)
      ).toString());
    message.maxStakeIcaCallsPerEpoch !== undefined &&
      (obj.maxStakeIcaCallsPerEpoch = (
        message.maxStakeIcaCallsPerEpoch || BigInt(0)
      ).toString());
    message.defaultMinRedemptionRateThreshold !== undefined &&
      (obj.defaultMinRedemptionRateThreshold = (
        message.defaultMinRedemptionRateThreshold || BigInt(0)
      ).toString());
    message.defaultMaxRedemptionRateThreshold !== undefined &&
      (obj.defaultMaxRedemptionRateThreshold = (
        message.defaultMaxRedemptionRateThreshold || BigInt(0)
      ).toString());
    message.ibcTransferTimeoutNanos !== undefined &&
      (obj.ibcTransferTimeoutNanos = (
        message.ibcTransferTimeoutNanos || BigInt(0)
      ).toString());
    message.validatorSlashQueryThreshold !== undefined &&
      (obj.validatorSlashQueryThreshold = (
        message.validatorSlashQueryThreshold || BigInt(0)
      ).toString());
    message.validatorWeightCap !== undefined &&
      (obj.validatorWeightCap = (
        message.validatorWeightCap || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.rewardsInterval =
      object.rewardsInterval !== undefined && object.rewardsInterval !== null
        ? BigInt(object.rewardsInterval.toString())
        : BigInt(0);
    message.delegateInterval =
      object.delegateInterval !== undefined && object.delegateInterval !== null
        ? BigInt(object.delegateInterval.toString())
        : BigInt(0);
    message.depositInterval =
      object.depositInterval !== undefined && object.depositInterval !== null
        ? BigInt(object.depositInterval.toString())
        : BigInt(0);
    message.redemptionRateInterval =
      object.redemptionRateInterval !== undefined &&
      object.redemptionRateInterval !== null
        ? BigInt(object.redemptionRateInterval.toString())
        : BigInt(0);
    message.strideCommission =
      object.strideCommission !== undefined && object.strideCommission !== null
        ? BigInt(object.strideCommission.toString())
        : BigInt(0);
    message.reinvestInterval =
      object.reinvestInterval !== undefined && object.reinvestInterval !== null
        ? BigInt(object.reinvestInterval.toString())
        : BigInt(0);
    message.icaTimeoutNanos =
      object.icaTimeoutNanos !== undefined && object.icaTimeoutNanos !== null
        ? BigInt(object.icaTimeoutNanos.toString())
        : BigInt(0);
    message.bufferSize =
      object.bufferSize !== undefined && object.bufferSize !== null
        ? BigInt(object.bufferSize.toString())
        : BigInt(0);
    message.ibcTimeoutBlocks =
      object.ibcTimeoutBlocks !== undefined && object.ibcTimeoutBlocks !== null
        ? BigInt(object.ibcTimeoutBlocks.toString())
        : BigInt(0);
    message.feeTransferTimeoutNanos =
      object.feeTransferTimeoutNanos !== undefined &&
      object.feeTransferTimeoutNanos !== null
        ? BigInt(object.feeTransferTimeoutNanos.toString())
        : BigInt(0);
    message.maxStakeIcaCallsPerEpoch =
      object.maxStakeIcaCallsPerEpoch !== undefined &&
      object.maxStakeIcaCallsPerEpoch !== null
        ? BigInt(object.maxStakeIcaCallsPerEpoch.toString())
        : BigInt(0);
    message.defaultMinRedemptionRateThreshold =
      object.defaultMinRedemptionRateThreshold !== undefined &&
      object.defaultMinRedemptionRateThreshold !== null
        ? BigInt(object.defaultMinRedemptionRateThreshold.toString())
        : BigInt(0);
    message.defaultMaxRedemptionRateThreshold =
      object.defaultMaxRedemptionRateThreshold !== undefined &&
      object.defaultMaxRedemptionRateThreshold !== null
        ? BigInt(object.defaultMaxRedemptionRateThreshold.toString())
        : BigInt(0);
    message.ibcTransferTimeoutNanos =
      object.ibcTransferTimeoutNanos !== undefined &&
      object.ibcTransferTimeoutNanos !== null
        ? BigInt(object.ibcTransferTimeoutNanos.toString())
        : BigInt(0);
    message.validatorSlashQueryThreshold =
      object.validatorSlashQueryThreshold !== undefined &&
      object.validatorSlashQueryThreshold !== null
        ? BigInt(object.validatorSlashQueryThreshold.toString())
        : BigInt(0);
    message.validatorWeightCap =
      object.validatorWeightCap !== undefined &&
      object.validatorWeightCap !== null
        ? BigInt(object.validatorWeightCap.toString())
        : BigInt(0);
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
      typeUrl: '/stride.stakeibc.Params',
      value: Params.encode(message).finish(),
    };
  },
};
