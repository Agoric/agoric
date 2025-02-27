import { AssetKind } from '@agoric/ertp';
import { makeTracer } from '@agoric/internal';
import { observeIteration, subscribeEach } from '@agoric/notifier';
import {
  CosmosChainInfoShape,
  DenomDetailShape,
  DenomShape,
  OrchestrationPowersShape,
  registerChainsAndAssets,
  withOrchestration,
} from '@agoric/orchestration';
import { makeZoeTools } from '@agoric/orchestration/src/utils/zoe-tools.js';
import { provideSingleton } from '@agoric/zoe/src/contractSupport/durability.js';
import { prepareRecorderKitMakers } from '@agoric/zoe/src/contractSupport/recorder.js';
import { Fail } from '@endo/errors';
import { E } from '@endo/far';
import { M } from '@endo/patterns';
import { prepareAdvancer } from './exos/advancer.js';
import { prepareLiquidityPoolKit } from './exos/liquidity-pool.js';
import { prepareSettler } from './exos/settler.js';
import { prepareStatusManager } from './exos/status-manager.js';
import { prepareTransactionFeedKit } from './exos/transaction-feed.js';
import * as flows from './fast-usdc.flows.js';
import { FastUSDCTermsShape, FeeConfigShape } from './type-guards.js';

const trace = makeTracer('FastUsdc');

const TXNS_NODE = 'txns';
const FEE_NODE = 'feeConfig';
const ADDRESSES_BAGGAGE_KEY = 'addresses';

/**
 * @import {HostInterface} from '@agoric/async-flow';
 * @import {CosmosChainInfo, Denom, DenomDetail, OrchestrationAccount, IBCConnectionInfo} from '@agoric/orchestration';
 * @import {OrchestrationPowers, OrchestrationTools} from '@agoric/orchestration/src/utils/start-helper.js';
 * @import {Remote} from '@agoric/internal';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js'
 * @import {Zone} from '@agoric/zone';
 * @import {OperatorOfferResult} from './exos/transaction-feed.js';
 * @import {ContractRecord, FeeConfig} from './types.js';
 */

/**
 * @typedef {{
 *   usdcDenom: Denom;
 * }} FastUsdcTerms
 */

/** @type {ContractMeta<typeof start>} */
export const meta = {
  // @ts-expect-error TypedPattern not recognized as record
  customTermsShape: FastUSDCTermsShape,
  privateArgsShape: {
    // @ts-expect-error TypedPattern not recognized as record
    ...OrchestrationPowersShape,
    assetInfo: M.arrayOf([DenomShape, DenomDetailShape]),
    chainInfo: M.recordOf(M.string(), CosmosChainInfoShape),
    feeConfig: FeeConfigShape,
    marshaller: M.remotable(),
    poolMetricsNode: M.remotable(),
  },
};
harden(meta);

/**
 * @param {Remote<StorageNode>} node
 * @param {ERef<Marshaller>} marshaller
 * @param {FeeConfig} feeConfig
 */
const publishFeeConfig = (node, marshaller, feeConfig) => {
  const feeNode = E(node).makeChildNode(FEE_NODE);
  void E.when(E(marshaller).toCapData(feeConfig), value =>
    E(feeNode).setValue(JSON.stringify(value)),
  );
};

/**
 * @param {Remote<StorageNode>} contractNode
 * @param {ContractRecord} addresses
 */
const publishAddresses = (contractNode, addresses) => {
  return E(contractNode).setValue(JSON.stringify(addresses));
};

/**
 * @param {ZCF<FastUsdcTerms>} zcf
 * @param {OrchestrationPowers & {
 *   assetInfo: [Denom, DenomDetail & { brandKey?: string}][];
 *   chainInfo: Record<string, CosmosChainInfo>;
 *   feeConfig: FeeConfig;
 *   marshaller: Marshaller;
 *   poolMetricsNode: Remote<StorageNode>;
 *   storageNode: Remote<StorageNode>;
 * }} privateArgs
 * @param {Zone} zone
 * @param {OrchestrationTools} tools
 */
export const contract = async (zcf, privateArgs, zone, tools) => {
  assert(tools, 'no tools');
  const terms = zcf.getTerms();
  assert('USDC' in terms.brands, 'no USDC brand');
  assert('usdcDenom' in terms, 'no usdcDenom');

  const { feeConfig, marshaller, storageNode } = privateArgs;
  const { makeRecorderKit } = prepareRecorderKitMakers(
    zone.mapStore('vstorage'),
    marshaller,
  );

  const statusManager = prepareStatusManager(
    zone,
    E(storageNode).makeChildNode(TXNS_NODE),
    { marshaller },
  );

  const { USDC } = terms.brands;
  const { withdrawToSeat } = tools.zoeTools;
  const { baggage, chainHub, orchestrateAll, vowTools } = tools;
  const makeSettler = prepareSettler(zone, {
    statusManager,
    USDC,
    withdrawToSeat,
    feeConfig,
    vowTools: tools.vowTools,
    zcf,
    chainHub,
  });

  const zoeTools = makeZoeTools(zcf, vowTools);
  const makeAdvancer = prepareAdvancer(zone, {
    chainHub,
    feeConfig,
    usdc: harden({
      brand: terms.brands.USDC,
      denom: terms.usdcDenom,
    }),
    statusManager,
    vowTools,
    zcf,
    zoeTools,
  });

  const makeFeedKit = prepareTransactionFeedKit(zone, zcf);

  const makeLiquidityPoolKit = prepareLiquidityPoolKit(
    zone,
    zcf,
    terms.brands.USDC,
    { makeRecorderKit },
  );

  const { makeLocalAccount, makeNobleAccount } = orchestrateAll(flows, {});

  const creatorFacet = zone.exo('Fast USDC Creator', undefined, {
    /** @type {(operatorId: string) => Promise<Invitation<OperatorOfferResult>>} */
    async makeOperatorInvitation(operatorId) {
      return feedKit.creator.makeOperatorInvitation(operatorId);
    },
    /** @type {(operatorId: string) => void} */
    removeOperator(operatorId) {
      return feedKit.creator.removeOperator(operatorId);
    },
    async getContractFeeBalance() {
      return poolKit.feeRecipient.getContractFeeBalance();
    },
    /** @type {() => Promise<Invitation<unknown>>} */
    async makeWithdrawFeesInvitation() {
      return poolKit.feeRecipient.makeWithdrawFeesInvitation();
    },
    /**
     * @param {string} agoricChainId
     * @param {string} nobleChainId
     * @param {IBCConnectionInfo} agoricToNoble
     */
    async connectToNoble(agoricChainId, nobleChainId, agoricToNoble) {
      trace('connectToNoble', agoricChainId, nobleChainId, agoricToNoble);
      chainHub.updateConnection(agoricChainId, nobleChainId, agoricToNoble);
      // v1 has `NobleAccount` which we don't expect to ever settle.
      const nobleAccountV = zone.makeOnce('NobleICA', () => makeNobleAccount());

      return vowTools.when(nobleAccountV, nobleAccount => {
        trace('nobleAccount', nobleAccount);
        return vowTools.when(
          E(nobleAccount).getAddress(),
          intermediateRecipient => {
            trace('intermediateRecipient', intermediateRecipient);
            advancer.setIntermediateRecipient(intermediateRecipient);
            settlerKit.creator.setIntermediateRecipient(intermediateRecipient);
            return intermediateRecipient;
          },
        );
      });
    },
    async publishAddresses() {
      !baggage.has(ADDRESSES_BAGGAGE_KEY) || Fail`Addresses already published`;
      const [poolAccountAddress] = await vowTools.when(
        vowTools.all([E(poolAccount).getAddress()]),
      );
      const addresses = harden({
        poolAccount: poolAccountAddress.value,
        settlementAccount: settlementAddress.value,
      });
      baggage.init(ADDRESSES_BAGGAGE_KEY, addresses);
      await publishAddresses(storageNode, addresses);
      return addresses;
    },
    deleteCompletedTxs() {
      return statusManager.deleteCompletedTxs();
    },
  });

  const publicFacet = zone.exo('Fast USDC Public', undefined, {
    makeDepositInvitation() {
      return poolKit.public.makeDepositInvitation();
    },
    makeWithdrawInvitation() {
      return poolKit.public.makeWithdrawInvitation();
    },
    getPublicTopics() {
      return poolKit.public.getPublicTopics();
    },
    getStaticInfo() {
      baggage.has(ADDRESSES_BAGGAGE_KEY) ||
        Fail`no addresses. creator must 'publishAddresses' first`;
      /** @type {ContractRecord} */
      const addresses = baggage.get(ADDRESSES_BAGGAGE_KEY);
      return harden({
        [ADDRESSES_BAGGAGE_KEY]: addresses,
      });
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

  publishFeeConfig(storageNode, marshaller, feeConfig);

  const shareMint = await provideSingleton(
    zone.mapStore('mint'),
    'PoolShare',
    () =>
      zcf.makeZCFMint('PoolShares', AssetKind.NAT, {
        decimalPlaces: 6,
      }),
  );

  const poolKit = zone.makeOnce('Liquidity Pool kit', () =>
    makeLiquidityPoolKit(shareMint, privateArgs.poolMetricsNode),
  );

  /** Chain, connection, and asset info can only be registered once */
  const firstIncarnationKey = 'firstIncarnationKey';
  if (!baggage.has(firstIncarnationKey)) {
    baggage.init(firstIncarnationKey, true);
    registerChainsAndAssets(
      chainHub,
      terms.brands,
      privateArgs.chainInfo,
      privateArgs.assetInfo,
    );
  }

  const feedKit = zone.makeOnce('Feed Kit', () => makeFeedKit());

  const poolAccountV = zone.makeOnce('PoolAccount', () => makeLocalAccount());
  const settleAccountV = zone.makeOnce('SettleAccount', () =>
    makeLocalAccount(),
  );
  // when() is OK here since this clearly resolves promptly.
  /** @type {[HostInterface<OrchestrationAccount<{chainId: 'agoric-3';}>>, HostInterface<OrchestrationAccount<{chainId: 'agoric-3';}>>]} */
  const [poolAccount, settlementAccount] = await vowTools.when(
    vowTools.all([poolAccountV, settleAccountV]),
  );
  trace('settlementAccount', settlementAccount);
  trace('poolAccount', poolAccount);
  const settlementAddress = await E(settlementAccount).getAddress();
  trace('settlementAddress', settlementAddress);

  const [_agoric, _noble, agToNoble] = await vowTools.when(
    chainHub.getChainsAndConnection('agoric', 'noble'),
  );
  const settlerKit = zone.makeOnce('settlerKit', () =>
    makeSettler({
      repayer: poolKit.repayer,
      sourceChannel: agToNoble.transferChannel.counterPartyChannelId,
      remoteDenom: 'uusdc',
      settlementAccount,
    }),
  );

  const advancer = zone.makeOnce('Advancer', () =>
    makeAdvancer({
      borrower: poolKit.borrower,
      notifier: settlerKit.notifier,
      poolAccount,
      settlementAddress,
    }),
  );
  // Connect evidence stream to advancer
  void observeIteration(subscribeEach(feedKit.public.getEvidenceSubscriber()), {
    updateState(evidenceWithRisk) {
      try {
        void advancer.handleTransactionEvent(evidenceWithRisk);
      } catch (err) {
        trace('🚨 Error handling transaction event', err);
      }
    },
  });

  await settlerKit.creator.monitorMintingDeposits();

  return harden({ creatorFacet, publicFacet });
};
harden(contract);

export const start = withOrchestration(contract);
harden(start);
/** @typedef {typeof start} FastUsdcSF */
