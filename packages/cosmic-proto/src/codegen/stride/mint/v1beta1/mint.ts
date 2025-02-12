//@ts-nocheck
import { BinaryReader, BinaryWriter } from '../../../binary.js';
import { Decimal, isSet } from '../../../helpers.js';
import { type JsonSafe } from '../../../json-safe.js';
/** Minter represents the minting state. */
export interface Minter {
  /** current epoch provisions */
  epochProvisions: string;
}
export interface MinterProtoMsg {
  typeUrl: '/stride.mint.v1beta1.Minter';
  value: Uint8Array;
}
/** Minter represents the minting state. */
export interface MinterSDKType {
  epoch_provisions: string;
}
/** next id: 5 */
export interface DistributionProportions {
  /**
   * staking defines the proportion of the minted minted_denom that is to be
   * allocated as staking rewards.
   */
  staking: string;
  /**
   * community_pool defines the proportion of the minted mint_denom that is
   * to be allocated to the community pool: growth.
   */
  communityPoolGrowth: string;
  /**
   * community_pool defines the proportion of the minted mint_denom that is
   * to be allocated to the community pool: security budget.
   */
  communityPoolSecurityBudget: string;
  /**
   * strategic_reserve defines the proportion of the minted mint_denom that is
   * to be allocated to the pool: strategic reserve.
   */
  strategicReserve: string;
}
export interface DistributionProportionsProtoMsg {
  typeUrl: '/stride.mint.v1beta1.DistributionProportions';
  value: Uint8Array;
}
/** next id: 5 */
export interface DistributionProportionsSDKType {
  staking: string;
  community_pool_growth: string;
  community_pool_security_budget: string;
  strategic_reserve: string;
}
/** Params holds parameters for the mint module. */
export interface Params {
  /** type of coin to mint */
  mintDenom: string;
  /** epoch provisions from the first epoch */
  genesisEpochProvisions: string;
  /** mint epoch identifier */
  epochIdentifier: string;
  /** number of epochs take to reduce rewards */
  reductionPeriodInEpochs: bigint;
  /** reduction multiplier to execute on each period */
  reductionFactor: string;
  /** distribution_proportions defines the proportion of the minted denom */
  distributionProportions: DistributionProportions;
  /** start epoch to distribute minting rewards */
  mintingRewardsDistributionStartEpoch: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: '/stride.mint.v1beta1.Params';
  value: Uint8Array;
}
/** Params holds parameters for the mint module. */
export interface ParamsSDKType {
  mint_denom: string;
  genesis_epoch_provisions: string;
  epoch_identifier: string;
  reduction_period_in_epochs: bigint;
  reduction_factor: string;
  distribution_proportions: DistributionProportionsSDKType;
  minting_rewards_distribution_start_epoch: bigint;
}
function createBaseMinter(): Minter {
  return {
    epochProvisions: '',
  };
}
export const Minter = {
  typeUrl: '/stride.mint.v1beta1.Minter',
  encode(
    message: Minter,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.epochProvisions !== '') {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.epochProvisions, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Minter {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMinter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochProvisions = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Minter {
    return {
      epochProvisions: isSet(object.epochProvisions)
        ? String(object.epochProvisions)
        : '',
    };
  },
  toJSON(message: Minter): JsonSafe<Minter> {
    const obj: any = {};
    message.epochProvisions !== undefined &&
      (obj.epochProvisions = message.epochProvisions);
    return obj;
  },
  fromPartial(object: Partial<Minter>): Minter {
    const message = createBaseMinter();
    message.epochProvisions = object.epochProvisions ?? '';
    return message;
  },
  fromProtoMsg(message: MinterProtoMsg): Minter {
    return Minter.decode(message.value);
  },
  toProto(message: Minter): Uint8Array {
    return Minter.encode(message).finish();
  },
  toProtoMsg(message: Minter): MinterProtoMsg {
    return {
      typeUrl: '/stride.mint.v1beta1.Minter',
      value: Minter.encode(message).finish(),
    };
  },
};
function createBaseDistributionProportions(): DistributionProportions {
  return {
    staking: '',
    communityPoolGrowth: '',
    communityPoolSecurityBudget: '',
    strategicReserve: '',
  };
}
export const DistributionProportions = {
  typeUrl: '/stride.mint.v1beta1.DistributionProportions',
  encode(
    message: DistributionProportions,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.staking !== '') {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.staking, 18).atomics);
    }
    if (message.communityPoolGrowth !== '') {
      writer
        .uint32(18)
        .string(Decimal.fromUserInput(message.communityPoolGrowth, 18).atomics);
    }
    if (message.communityPoolSecurityBudget !== '') {
      writer
        .uint32(26)
        .string(
          Decimal.fromUserInput(message.communityPoolSecurityBudget, 18)
            .atomics,
        );
    }
    if (message.strategicReserve !== '') {
      writer
        .uint32(34)
        .string(Decimal.fromUserInput(message.strategicReserve, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): DistributionProportions {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistributionProportions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.staking = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 2:
          message.communityPoolGrowth = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 3:
          message.communityPoolSecurityBudget = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 4:
          message.strategicReserve = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): DistributionProportions {
    return {
      staking: isSet(object.staking) ? String(object.staking) : '',
      communityPoolGrowth: isSet(object.communityPoolGrowth)
        ? String(object.communityPoolGrowth)
        : '',
      communityPoolSecurityBudget: isSet(object.communityPoolSecurityBudget)
        ? String(object.communityPoolSecurityBudget)
        : '',
      strategicReserve: isSet(object.strategicReserve)
        ? String(object.strategicReserve)
        : '',
    };
  },
  toJSON(message: DistributionProportions): JsonSafe<DistributionProportions> {
    const obj: any = {};
    message.staking !== undefined && (obj.staking = message.staking);
    message.communityPoolGrowth !== undefined &&
      (obj.communityPoolGrowth = message.communityPoolGrowth);
    message.communityPoolSecurityBudget !== undefined &&
      (obj.communityPoolSecurityBudget = message.communityPoolSecurityBudget);
    message.strategicReserve !== undefined &&
      (obj.strategicReserve = message.strategicReserve);
    return obj;
  },
  fromPartial(
    object: Partial<DistributionProportions>,
  ): DistributionProportions {
    const message = createBaseDistributionProportions();
    message.staking = object.staking ?? '';
    message.communityPoolGrowth = object.communityPoolGrowth ?? '';
    message.communityPoolSecurityBudget =
      object.communityPoolSecurityBudget ?? '';
    message.strategicReserve = object.strategicReserve ?? '';
    return message;
  },
  fromProtoMsg(
    message: DistributionProportionsProtoMsg,
  ): DistributionProportions {
    return DistributionProportions.decode(message.value);
  },
  toProto(message: DistributionProportions): Uint8Array {
    return DistributionProportions.encode(message).finish();
  },
  toProtoMsg(
    message: DistributionProportions,
  ): DistributionProportionsProtoMsg {
    return {
      typeUrl: '/stride.mint.v1beta1.DistributionProportions',
      value: DistributionProportions.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    mintDenom: '',
    genesisEpochProvisions: '',
    epochIdentifier: '',
    reductionPeriodInEpochs: BigInt(0),
    reductionFactor: '',
    distributionProportions: DistributionProportions.fromPartial({}),
    mintingRewardsDistributionStartEpoch: BigInt(0),
  };
}
export const Params = {
  typeUrl: '/stride.mint.v1beta1.Params',
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create(),
  ): BinaryWriter {
    if (message.mintDenom !== '') {
      writer.uint32(10).string(message.mintDenom);
    }
    if (message.genesisEpochProvisions !== '') {
      writer
        .uint32(18)
        .string(
          Decimal.fromUserInput(message.genesisEpochProvisions, 18).atomics,
        );
    }
    if (message.epochIdentifier !== '') {
      writer.uint32(26).string(message.epochIdentifier);
    }
    if (message.reductionPeriodInEpochs !== BigInt(0)) {
      writer.uint32(32).int64(message.reductionPeriodInEpochs);
    }
    if (message.reductionFactor !== '') {
      writer
        .uint32(42)
        .string(Decimal.fromUserInput(message.reductionFactor, 18).atomics);
    }
    if (message.distributionProportions !== undefined) {
      DistributionProportions.encode(
        message.distributionProportions,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    if (message.mintingRewardsDistributionStartEpoch !== BigInt(0)) {
      writer.uint32(56).int64(message.mintingRewardsDistributionStartEpoch);
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
          message.mintDenom = reader.string();
          break;
        case 2:
          message.genesisEpochProvisions = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 3:
          message.epochIdentifier = reader.string();
          break;
        case 4:
          message.reductionPeriodInEpochs = reader.int64();
          break;
        case 5:
          message.reductionFactor = Decimal.fromAtomics(
            reader.string(),
            18,
          ).toString();
          break;
        case 6:
          message.distributionProportions = DistributionProportions.decode(
            reader,
            reader.uint32(),
          );
          break;
        case 7:
          message.mintingRewardsDistributionStartEpoch = reader.int64();
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
      mintDenom: isSet(object.mintDenom) ? String(object.mintDenom) : '',
      genesisEpochProvisions: isSet(object.genesisEpochProvisions)
        ? String(object.genesisEpochProvisions)
        : '',
      epochIdentifier: isSet(object.epochIdentifier)
        ? String(object.epochIdentifier)
        : '',
      reductionPeriodInEpochs: isSet(object.reductionPeriodInEpochs)
        ? BigInt(object.reductionPeriodInEpochs.toString())
        : BigInt(0),
      reductionFactor: isSet(object.reductionFactor)
        ? String(object.reductionFactor)
        : '',
      distributionProportions: isSet(object.distributionProportions)
        ? DistributionProportions.fromJSON(object.distributionProportions)
        : undefined,
      mintingRewardsDistributionStartEpoch: isSet(
        object.mintingRewardsDistributionStartEpoch,
      )
        ? BigInt(object.mintingRewardsDistributionStartEpoch.toString())
        : BigInt(0),
    };
  },
  toJSON(message: Params): JsonSafe<Params> {
    const obj: any = {};
    message.mintDenom !== undefined && (obj.mintDenom = message.mintDenom);
    message.genesisEpochProvisions !== undefined &&
      (obj.genesisEpochProvisions = message.genesisEpochProvisions);
    message.epochIdentifier !== undefined &&
      (obj.epochIdentifier = message.epochIdentifier);
    message.reductionPeriodInEpochs !== undefined &&
      (obj.reductionPeriodInEpochs = (
        message.reductionPeriodInEpochs || BigInt(0)
      ).toString());
    message.reductionFactor !== undefined &&
      (obj.reductionFactor = message.reductionFactor);
    message.distributionProportions !== undefined &&
      (obj.distributionProportions = message.distributionProportions
        ? DistributionProportions.toJSON(message.distributionProportions)
        : undefined);
    message.mintingRewardsDistributionStartEpoch !== undefined &&
      (obj.mintingRewardsDistributionStartEpoch = (
        message.mintingRewardsDistributionStartEpoch || BigInt(0)
      ).toString());
    return obj;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.mintDenom = object.mintDenom ?? '';
    message.genesisEpochProvisions = object.genesisEpochProvisions ?? '';
    message.epochIdentifier = object.epochIdentifier ?? '';
    message.reductionPeriodInEpochs =
      object.reductionPeriodInEpochs !== undefined &&
      object.reductionPeriodInEpochs !== null
        ? BigInt(object.reductionPeriodInEpochs.toString())
        : BigInt(0);
    message.reductionFactor = object.reductionFactor ?? '';
    message.distributionProportions =
      object.distributionProportions !== undefined &&
      object.distributionProportions !== null
        ? DistributionProportions.fromPartial(object.distributionProportions)
        : undefined;
    message.mintingRewardsDistributionStartEpoch =
      object.mintingRewardsDistributionStartEpoch !== undefined &&
      object.mintingRewardsDistributionStartEpoch !== null
        ? BigInt(object.mintingRewardsDistributionStartEpoch.toString())
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
      typeUrl: '/stride.mint.v1beta1.Params',
      value: Params.encode(message).finish(),
    };
  },
};
