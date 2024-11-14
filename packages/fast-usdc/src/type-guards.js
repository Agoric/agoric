import { AmountShape, BrandShape, RatioShape } from '@agoric/ertp';
import { M } from '@endo/patterns';
import { PendingTxStatus } from './constants.js';

/**
 * @import {TypedPattern} from '@agoric/internal';
 * @import {FastUsdcTerms} from './fast-usdc.contract.ts';
 * @import {USDCProposalShapes} from './pool-share-math.js';
 * @import {CctpTxEvidence, FeeConfig, PendingTx, PoolMetrics, ChainPolicy, FeedPolicy} from './types.js';
 */

/**
 * @param {Brand} brand must be a 'nat' brand, not checked
 * @param {NatValue} [min]
 */
export const makeNatAmountShape = (brand, min) =>
  harden({ brand, value: min ? M.gte(min) : M.nat() });

/** @param {Record<'PoolShares' | 'USDC', Brand<'nat'>>} brands */
export const makeProposalShapes = ({ PoolShares, USDC }) => {
  /** @type {TypedPattern<USDCProposalShapes['deposit']>} */
  const deposit = M.splitRecord(
    { give: { USDC: makeNatAmountShape(USDC, 1n) } },
    { want: { PoolShare: makeNatAmountShape(PoolShares) } },
  );
  /** @type {TypedPattern<USDCProposalShapes['withdraw']>} */
  const withdraw = M.splitRecord({
    give: { PoolShare: makeNatAmountShape(PoolShares, 1n) },
    want: { USDC: makeNatAmountShape(USDC, 1n) },
  });
  return harden({ deposit, withdraw });
};

/** @type {TypedPattern<FastUsdcTerms>} */
export const FastUSDCTermsShape = harden({
  usdcDenom: M.string(),
});

/** @type {TypedPattern<string>} */
export const EvmHashShape = M.string({
  stringLengthLimit: 66,
});
harden(EvmHashShape);

/** @type {TypedPattern<CctpTxEvidence>} */
export const CctpTxEvidenceShape = {
  aux: {
    forwardingChannel: M.string(),
    recipientAddress: M.string(),
  },
  blockHash: EvmHashShape,
  blockNumber: M.bigint(),
  blockTimestamp: M.bigint(),
  chainId: M.number(),
  tx: {
    amount: M.bigint(),
    forwardingAddress: M.string(),
  },
  txHash: EvmHashShape,
};
harden(CctpTxEvidenceShape);

/** @type {TypedPattern<PendingTx>} */
// @ts-expect-error TypedPattern not recognized as record
export const PendingTxShape = {
  ...CctpTxEvidenceShape,
  status: M.or(...Object.values(PendingTxStatus)),
};
harden(PendingTxShape);

export const EudParamShape = {
  EUD: M.string(),
};
harden(EudParamShape);

const NatAmountShape = { brand: BrandShape, value: M.nat() };
/** @type {TypedPattern<FeeConfig>} */
export const FeeConfigShape = {
  flat: NatAmountShape,
  variableRate: RatioShape,
  maxVariable: NatAmountShape,
  contractRate: RatioShape,
};
harden(FeeConfigShape);

/** @type {TypedPattern<PoolMetrics>} */
export const PoolMetricsShape = {
  encumberedBalance: AmountShape,
  shareWorth: RatioShape,
  totalContractFees: AmountShape,
  totalPoolFees: AmountShape,
  totalBorrows: AmountShape,
  totalRepays: AmountShape,
};
harden(PoolMetricsShape);

/** @type {TypedPattern<ChainPolicy>} */
export const ChainPoliciesShape = M.splitRecord(
  {
    nobleContractAddress: EvmHashShape,
    cctpTokenMessengerAddress: EvmHashShape,
    confirmations: M.number(),
    chainId: M.number(),
  },
  { chainType: M.number() },
);
harden(ChainPoliciesShape);

/**
 * @type {TypedPattern<FeedPolicy>}
 *
 * Should be JSON serializable so CLI can specify policy. E.g. no bigint,
 * undefined, remotable, etc.
 */
export const FeedPolicyShape = M.splitRecord(
  {
    nobleDomainId: M.number(),
    nobleAgoricChannelId: M.string(),
    chainPolicies: M.recordOf(M.string(), ChainPoliciesShape),
  },
  { eventFilter: M.string() },
);
harden(FeedPolicyShape);
