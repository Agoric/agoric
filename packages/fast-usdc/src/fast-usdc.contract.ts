import { AssetKind } from '@agoric/ertp';
import {
  assertAllDefined,
  deeplyFulfilledObject,
  makeTracer,
} from '@agoric/internal';
import { observeIteration, subscribeEach } from '@agoric/notifier';
import {
  OrchestrationPowersShape,
  withOrchestration,
  type Denom,
  type OrchestrationAccount,
  type OrchestrationPowers,
  type OrchestrationTools,
} from '@agoric/orchestration';
import { makeZoeTools } from '@agoric/orchestration/src/utils/zoe-tools.js';
import { provideSingleton } from '@agoric/zoe/src/contractSupport/durability.js';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/recorder.js';
import { depositToSeat } from '@agoric/zoe/src/contractSupport/zoeHelpers.js';
import { E } from '@endo/far';
import { M, objectMap } from '@endo/patterns';
import type { Zone } from '@agoric/zone';
import type { HostInterface } from '@agoric/async-flow';
import type { Vow } from '@agoric/vow';
import { prepareAdvancer } from './exos/advancer.js';
import {
  prepareLiquidityPoolKit,
  type RepayAmountKWR,
  type RepayPaymentKWR,
} from './exos/liquidity-pool.js';
import { prepareSettler } from './exos/settler.js';
import { prepareStatusManager } from './exos/status-manager.js';
import { prepareTransactionFeedKit } from './exos/transaction-feed.js';
import * as flows from './fast-usdc.flows.js';
import { FastUSDCTermsShape, FeeConfigShape } from './type-guards.js';
import { defineInertInvitation } from './utils/zoe.js';
import type { CctpTxEvidence, FeeConfig } from './types.js';
import type { OperatorKit } from './exos/operator-kit.js';

const trace = makeTracer('FastUsdc');

export type FastUsdcTerms = {
  usdcDenom: Denom;
};

export const meta = {
  customTermsShape: FastUSDCTermsShape,
  privateArgsShape: {
    // @ts-expect-error TypedPattern not recognized as record
    ...OrchestrationPowersShape,
    feeConfig: FeeConfigShape,
    marshaller: M.remotable(),
  },
} as ContractMeta<typeof start>;
harden(meta);

export const contract = async (
  zcf: ZCF<FastUsdcTerms>,
  privateArgs: OrchestrationPowers & {
    feeConfig: FeeConfig;
    marshaller: Marshaller;
    storageNode: StorageNode;
  },
  zone: Zone,
  tools: OrchestrationTools,
) => {
  assert(tools, 'no tools');
  const terms = zcf.getTerms();
  assert('USDC' in terms.brands, 'no USDC brand');
  assert('usdcDenom' in terms, 'no usdcDenom');
  const { feeConfig, marshaller } = privateArgs;
  const { makeRecorderKit } = prepareRecorderKitMakers(
    zone.mapStore('vstorage'),
    marshaller,
  );
  const statusManager = prepareStatusManager(zone);
  const makeSettler = prepareSettler(zone, { statusManager });
  const { chainHub, orchestrateAll, vowTools } = tools;
  const { localTransfer } = makeZoeTools(zcf, vowTools);
  const makeAdvancer = prepareAdvancer(zone, {
    chainHub,
    feeConfig,
    localTransfer,
    usdc: harden({
      brand: terms.brands.USDC,
      denom: terms.usdcDenom,
    }),
    statusManager,
    vowTools,
    zcf,
  });
  const makeFeedKit = prepareTransactionFeedKit(zone, zcf);
  assertAllDefined({ makeFeedKit, makeAdvancer, makeSettler, statusManager });
  const makeLiquidityPoolKit = prepareLiquidityPoolKit(
    zone,
    zcf,
    terms.brands.USDC,
    { makeRecorderKit },
  );

  const makeTestInvitation = defineInertInvitation(
    zcf,
    'test of forcing evidence',
  );

  const { makeLocalAccount } = orchestrateAll(flows, {});

  const creatorFacet = zone.exo('Fast USDC Creator', undefined, {
    async makeOperatorInvitation(
      operatorId: string,
    ): Promise<Invitation<OperatorKit>> {
      return feedKit.creator.makeOperatorInvitation(operatorId);
    },
    testBorrow(amounts: { USDC: Amount<'nat'> }) {
      console.log('🚧🚧 UNTIL: borrow is integrated (#10388) 🚧🚧', amounts);
      const { zcfSeat: tmpAssetManagerSeat } = zcf.makeEmptySeatKit();
      poolKit.borrower.borrow(tmpAssetManagerSeat, amounts);
      return tmpAssetManagerSeat.getCurrentAllocation();
    },
    async testRepay(
      amounts: RepayAmountKWR,
      payments: RepayPaymentKWR,
    ): Promise<AmountKeywordRecord> {
      console.log('🚧🚧 UNTIL: repay is integrated (#10388) 🚧🚧', amounts);
      const { zcfSeat: tmpAssetManagerSeat } = zcf.makeEmptySeatKit();
      await depositToSeat(
        zcf,
        tmpAssetManagerSeat,
        await deeplyFulfilledObject(
          objectMap(payments, pmt => E(terms.issuers.USDC).getAmountOf(pmt)),
        ),
        payments,
      );
      poolKit.repayer.repay(tmpAssetManagerSeat, amounts);
      return tmpAssetManagerSeat.getCurrentAllocation();
    },
  });

  const publicFacet = zone.exo('Fast USDC Public', undefined, {
    // XXX to be removed before production
    /**
     * NB: Any caller with access to this invitation maker has the ability to
     * force handling of evidence.
     *
     * Provide an API call in the form of an invitation maker, so that the
     * capability is available in the smart-wallet bridge during UI testing.
     *
     * @param evidence
     */
    makeTestPushInvitation(evidence: CctpTxEvidence) {
      void advancer.handleTransactionEvent(evidence);
      return makeTestInvitation();
    },
    makeDepositInvitation() {
      return poolKit.public.makeDepositInvitation();
    },
    makeWithdrawInvitation() {
      return poolKit.public.makeWithdrawInvitation();
    },
    getPublicTopics() {
      return poolKit.public.getPublicTopics();
    },
  });

  // ^^^ Define all kinds above this line. Keep remote calls below. vvv

  // NOTE: Using a ZCFMint is helpful for the usual reasons (
  // synchronous mint/burn, keeping assets out of contract vats, ...).
  // And there's just one pool, which suggests building it with zone.exo().
  //
  // But zone.exo() defines a kind and
  // all kinds have to be defined before any remote calls,
  // such as the one to the zoe vat as part of making a ZCFMint.
  //
  // So we use zone.exoClassKit above to define the liquidity pool kind
  // and pass the shareMint into the maker / init function.

  const shareMint = await provideSingleton(
    zone.mapStore('mint'),
    'PoolShare',
    () =>
      zcf.makeZCFMint('PoolShares', AssetKind.NAT, {
        decimalPlaces: 6,
      }),
  );

  const poolKit = zone.makeOnce('Liquidity Pool kit', () =>
    makeLiquidityPoolKit(shareMint, privateArgs.storageNode),
  );

  const feedKit = zone.makeOnce('Feed Kit', () => makeFeedKit());

  const poolAccountV = zone.makeOnce('Pool Local Orch Account', () =>
    makeLocalAccount(),
  ) as unknown as Vow<
    // cast to HostInterface
    HostInterface<OrchestrationAccount<{ chainId: 'agoric' }>>
  >;
  const poolAccount = await vowTools.when(poolAccountV);

  const advancer = zone.makeOnce('Advancer', () =>
    makeAdvancer({
      borrowerFacet: poolKit.borrower,
      poolAccount,
    }),
  );
  // Connect evidence stream to advancer
  void observeIteration(subscribeEach(feedKit.public.getEvidenceSubscriber()), {
    updateState(evidence) {
      try {
        void advancer.handleTransactionEvent(evidence);
      } catch (err) {
        trace('🚨 Error handling transaction event', err);
      }
    },
  });

  return harden({ creatorFacet, publicFacet });
};
harden(contract);

export const start = withOrchestration(contract);
harden(start);

export type FastUsdcSF = typeof start;
