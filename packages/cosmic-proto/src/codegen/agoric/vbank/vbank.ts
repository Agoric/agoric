//@ts-nocheck
import { Coin, type CoinSDKType } from '../../cosmos/base/v1beta1/coin.js';
import { BinaryReader, BinaryWriter } from '../../binary.js';
import { Decimal } from '../../decimals.js';
import { isSet } from '../../helpers.js';
import { type JsonSafe } from '../../json-safe.js';
/** The module governance/configuration parameters. */
export interface Params {
  /**
   * reward_epoch_duration_blocks is the length of a reward epoch, in blocks.
   * A value of zero has the same meaning as a value of one:
   * the full reward buffer should be distributed immediately.
   */
  rewardEpochDurationBlocks: bigint;
  /**
   * per_epoch_reward_fraction is a fraction of the reward pool to distrubute
   * once every reward epoch.  If less than zero, use approximately continuous
   * per-block distribution.
   */
  perEpochRewardFraction: string;
  /**
   * reward_smoothing_blocks is the number of blocks over which to distribute
   * an epoch's rewards.  If zero, use the same value as
   * reward_epoch_duration_blocks.
   */
  rewardSmoothingBlocks: bigint;
  /**
   * allowed_monitoring_accounts is an array of account addresses that can be
   * monitored for sends and receives.  An element of `"*"` will permit any
   * address.
   */
  allowedMonitoringAccounts: string[];
}
export interface ParamsProtoMsg {
  typeUrl: '/agoric.vbank.Params';
  value: Uint8Array;
}
/** The module governance/configuration parameters. */
export interface ParamsSDKType {
  reward_epoch_duration_blocks: bigint;
  per_epoch_reward_fraction: string;
  reward_smoothing_blocks: bigint;
  allowed_monitoring_accounts: string[];
}
/** The current state of the module. */
export interface State {
  /**
   * rewardPool is the current balance of rewards in the module account.
   * NOTE: Tracking manually since there is no bank call for getting a
   * module account balance by name.
   */
  rewardPool: Coin[];
  /**
   * reward_block_amount is the amount of reward, if available, to send to the
   * fee collector module on every block.
   */
  rewardBlockAmount: Coin[];
  /** last_sequence is a sequence number for communicating with the VM. */
  lastSequence: bigint;
  lastRewardDistributionBlock: bigint;
}
export interface StateProtoMsg {
  typeUrl: '/agoric.vbank.State';
  value: Uint8Array;
}
/** The current state of the module. */
export interface StateSDKType {
  reward_pool: CoinSDKType[];
  reward_block_amount: CoinSDKType[];
  last_sequence: bigint;
  last_reward_distribution_block: bigint;
}
function createBaseParams(): Params {
  return {
    rewardEpochDurationBlocks: BigInt(0),
    perEpochRewardFraction: '',
    rewardSmoothingBlocks: BigInt(0),
    allowedMonitoringAccounts: [],
  };
}
export const Params = {
  typeUrl: '/agoric.vbank.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.rewardEpochDurationBlocks !== BigInt(0)) {
      writer.uint32(8).int64(message.rewardEpochDurationBlocks);
    }
    if (message.perEpochRewardFraction !== '') {
      writer
        .uint32(18)
        .string(
          Decimal.fromUserInput(message.perEpochRewardFraction, 18).atomics,
        );
    }
    if (message.rewardSmoothingBlocks !== BigInt(0)) {
      writer.uint32(24).int64(message.rewardSmoothingBlocks);
    }
    for (const v of message.allowedMonitoringAccounts) {
      writer.uint32(34).string(v!);
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
          message.rewardEpochDurationBlocks = reader.int64();
          break;
        case 2:
          message.perEpochRewardFraction = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 3:
          message.rewardSmoothingBlocks = reader.int64();
          break;
        case 4:
          message.allowedMonitoringAccounts.push(reader.string());
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
      rewardEpochDurationBlocks: isSet(object.rewardEpochDurationBlocks)
        ? BigInt(object.rewardEpochDurationBlocks.toString())
        : BigInt(0),
      perEpochRewardFraction: isSet(object.perEpochRewardFraction)
        ? String(object.perEpochRewardFraction)
        : '',
      rewardSmoothingBlocks: isSet(object.rewardSmoothingBlocks)
        ? BigInt(object.rewardSmoothingBlocks.toString())
        : BigInt(0),
      allowedMonitoringAccounts: Array.isArray(
        object?.allowedMonitoringAccounts,
      )
        ? object.allowedMonitoringAccounts.map((e: any) => String(e))
        : [],
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.rewardEpochDurationBlocks !== undefined &&
      (obj.rewardEpochDurationBlocks = (
        message.rewardEpochDurationBlocks || BigInt(0)
      ).toString());
    message.perEpochRewardFraction !== undefined &&
      (obj.perEpochRewardFraction = message.perEpochRewardFraction);
    message.rewardSmoothingBlocks !== undefined &&
      (obj.rewardSmoothingBlocks = (
        message.rewardSmoothingBlocks || BigInt(0)
      ).toString());
    if (message.allowedMonitoringAccounts) {
      obj.allowedMonitoringAccounts = message.allowedMonitoringAccounts.map(
        e => e,
      );
    } else {
      obj.allowedMonitoringAccounts = [];
    }
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.rewardEpochDurationBlocks =
      object.rewardEpochDurationBlocks !== undefined &&
      object.rewardEpochDurationBlocks !== null
        ? BigInt(object.rewardEpochDurationBlocks.toString())
        : BigInt(0);
    message.perEpochRewardFraction = object.perEpochRewardFraction ?? '';
    message.rewardSmoothingBlocks =
      object.rewardSmoothingBlocks !== undefined &&
      object.rewardSmoothingBlocks !== null
        ? BigInt(object.rewardSmoothingBlocks.toString())
        : BigInt(0);
    message.allowedMonitoringAccounts =
      object.allowedMonitoringAccounts?.map(e => e) || [];
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
      typeUrl: '/agoric.vbank.Params',
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseState(): State {
  return {
    rewardPool: [],
    rewardBlockAmount: [],
    lastSequence: BigInt(0),
    lastRewardDistributionBlock: BigInt(0),
  };
}
export const State = {
  typeUrl: '/agoric.vbank.State',
  encode(
    message: State,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    for (const v of message.rewardPool) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.rewardBlockAmount) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.lastSequence !== BigInt(0)) {
      writer.uint32(24).uint64(message.lastSequence);
    }
    if (message.lastRewardDistributionBlock !== BigInt(0)) {
      writer.uint32(32).int64(message.lastRewardDistributionBlock);
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
          message.rewardPool.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.rewardBlockAmount.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.lastSequence = reader.uint64();
          break;
        case 4:
          message.lastRewardDistributionBlock = reader.int64();
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
      rewardPool: Array.isArray(object?.rewardPool)
        ? object.rewardPool.map((e: any) => Coin.fromJSON(e))
        : [],
      rewardBlockAmount: Array.isArray(object?.rewardBlockAmount)
        ? object.rewardBlockAmount.map((e: any) => Coin.fromJSON(e))
        : [],
      lastSequence: isSet(object.lastSequence)
        ? BigInt(object.lastSequence.toString())
        : BigInt(0),
      lastRewardDistributionBlock: isSet(object.lastRewardDistributionBlock)
        ? BigInt(object.lastRewardDistributionBlock.toString())
        : BigInt(0),
    };
  },
  toJSON(message: State): JsonSafe<State> {
    const obj: any = {};
    if (message.rewardPool) {
      obj.rewardPool = message.rewardPool.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.rewardPool = [];
    }
    if (message.rewardBlockAmount) {
      obj.rewardBlockAmount = message.rewardBlockAmount.map(e =>
        e ? Coin.toJSON(e) : undefined,
      );
    } else {
      obj.rewardBlockAmount = [];
    }
    message.lastSequence !== undefined &&
      (obj.lastSequence = (message.lastSequence || BigInt(0)).toString());
    message.lastRewardDistributionBlock !== undefined &&
      (obj.lastRewardDistributionBlock = (
        message.lastRewardDistributionBlock || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<State>): State {
    const message = createBaseState();
    message.rewardPool = object.rewardPool?.map(e => Coin.fromPartial(e)) || [];
    message.rewardBlockAmount =
      object.rewardBlockAmount?.map(e => Coin.fromPartial(e)) || [];
    message.lastSequence =
      object.lastSequence !== undefined && object.lastSequence !== null
        ? BigInt(object.lastSequence.toString())
        : BigInt(0);
    message.lastRewardDistributionBlock =
      object.lastRewardDistributionBlock !== undefined &&
      object.lastRewardDistributionBlock !== null
        ? BigInt(object.lastRewardDistributionBlock.toString())
        : BigInt(0);
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
      typeUrl: '/agoric.vbank.State',
      value: State.encode(message).finish(),
    };
  },
};
