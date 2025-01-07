import { makeIssuerKit } from '@agoric/ertp';
import { VTRANSFER_IBC_EVENT } from '@agoric/internal/src/action-types.js';
import {
  defaultSerializer,
  makeFakeStorageKit,
} from '@agoric/internal/src/storage-test-utils.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import {
  denomHash,
  withChainCapabilities,
  type CosmosChainInfo,
  type Denom,
} from '@agoric/orchestration';
import { registerKnownChains } from '@agoric/orchestration/src/chain-info.js';
import {
  makeChainHub,
  type DenomDetail,
} from '@agoric/orchestration/src/exos/chain-hub.js';
import { prepareCosmosInterchainService } from '@agoric/orchestration/src/exos/cosmos-interchain-service.js';
import fetchedChainInfo from '@agoric/orchestration/src/fetched-chain-info.js';
import { setupFakeNetwork } from '@agoric/orchestration/test/network-fakes.js';
import { buildVTransferEvent } from '@agoric/orchestration/tools/ibc-mocks.js';
import { makeTestAddress } from '@agoric/orchestration/tools/make-test-address.js';
import { reincarnate } from '@agoric/swingset-liveslots/tools/setup-vat-data.js';
import { makeNameHubKit } from '@agoric/vats';
import { prepareBridgeTargetModule } from '@agoric/vats/src/bridge-target.js';
import { makeWellKnownSpaces } from '@agoric/vats/src/core/utils.js';
import { prepareLocalChainTools } from '@agoric/vats/src/localchain.js';
import { prepareTransferTools } from '@agoric/vats/src/transfer.js';
import { makeFakeBankManagerKit } from '@agoric/vats/tools/bank-utils.js';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import {
  makeFakeLocalchainBridge,
  makeFakeTransferBridge,
} from '@agoric/vats/tools/fake-bridge.js';
import { prepareSwingsetVowTools } from '@agoric/vow/vat.js';
import type { Installation } from '@agoric/zoe/src/zoeService/utils.js';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import { withAmountUtils } from '@agoric/zoe/tools/test-utils.js';
import { makeHeapZone, type Zone } from '@agoric/zone';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { E } from '@endo/far';
import type { ExecutionContext } from 'ava';
import { makeTestFeeConfig } from './mocks.js';

export {
  makeFakeLocalchainBridge,
  makeFakeTransferBridge,
} from '@agoric/vats/tools/fake-bridge.js';

const assetOn = (
  baseDenom: Denom,
  baseName: string,
  chainName?: string,
  infoOf?: Record<string, CosmosChainInfo>,
  brandKey?: string,
): [string, DenomDetail & { brandKey?: string }] => {
  if (!chainName) {
    return [baseDenom, { baseName, chainName: baseName, baseDenom }];
  }
  if (!infoOf) throw Error(`must provide infoOf`);
  const issuerInfo = infoOf[baseName];
  const holdingInfo = infoOf[chainName];
  if (!holdingInfo) throw Error(`${chainName} missing`);
  if (!holdingInfo.connections)
    throw Error(`connections missing for ${chainName}`);
  const { channelId } =
    holdingInfo.connections[issuerInfo.chainId].transferChannel;
  const denom = `ibc/${denomHash({ denom: baseDenom, channelId })}`;
  return [denom, { baseName, chainName, baseDenom, brandKey }];
};

export const [uusdcOnAgoric, agUSDCDetail] = assetOn(
  'uusdc',
  'noble',
  'agoric',
  fetchedChainInfo,
  'USDC',
);

export const commonSetup = async (t: ExecutionContext<any>) => {
  t.log('bootstrap vat dependencies');
  // The common setup cannot support a durable zone because many of the fakes are not durable.
  // They were made before we had durable kinds (and thus don't take a zone or baggage).
  // To test durability in unit tests, test a particular entity with `relaxDurabilityRules: false`.
  // To test durability integrating multiple vats, use a RunUtils/bootstrap test.
  const rootZone = makeHeapZone();

  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();

  const usdc = withAmountUtils(makeIssuerKit('USDC'));
  const bankBridgeMessages = [] as any[];
  const { bankManager, pourPayment } = await makeFakeBankManagerKit({
    onToBridge: obj => bankBridgeMessages.push(obj),
  });
  await E(bankManager).addAsset(
    uusdcOnAgoric,
    'USDC',
    'USD Circle Stablecoin',
    usdc.issuerKit,
  );
  // These mints no longer stay in sync with bankManager.
  // Use pourPayment() for IST.
  const { mint: _i, ...usdcSansMint } = usdc;
  // XXX real bankManager does this. fake should too?
  // TODO https://github.com/Agoric/agoric-sdk/issues/9966
  await makeWellKnownSpaces(agoricNamesAdmin, t.log, ['vbankAsset']);
  await E(E(agoricNamesAdmin).lookupAdmin('vbankAsset')).update(
    uusdcOnAgoric,
    /** @type {AssetInfo} */ harden({
      brand: usdc.brand,
      issuer: usdc.issuer,
      issuerName: 'USDC',
      denom: 'uusdc',
      proposedName: 'USDC',
      displayInfo: { IOU: true },
    }),
  );

  const vowTools = prepareSwingsetVowTools(rootZone.subZone('vows'));

  const transferBridge = makeFakeTransferBridge(rootZone);
  const { makeBridgeTargetKit } = prepareBridgeTargetModule(
    rootZone.subZone('bridge'),
  );
  const { makeTransferMiddlewareKit } = prepareTransferTools(
    rootZone.subZone('transfer'),
    vowTools,
  );

  const { finisher, interceptorFactory, transferMiddleware } =
    makeTransferMiddlewareKit();
  const bridgeTargetKit = makeBridgeTargetKit(
    transferBridge,
    VTRANSFER_IBC_EVENT,
    interceptorFactory,
  );
  finisher.useRegistry(bridgeTargetKit.targetRegistry);
  await E(transferBridge).initHandler(bridgeTargetKit.bridgeHandler);

  const localBridgeMessages = [] as any[];
  const localchainBridge = makeFakeLocalchainBridge(
    rootZone,
    obj => localBridgeMessages.push(obj),
    makeTestAddress,
  );
  const localchain = prepareLocalChainTools(
    rootZone.subZone('localchain'),
    vowTools,
  ).makeLocalChain({
    bankManager,
    system: localchainBridge,
    transfer: transferMiddleware,
  });
  const timer = buildZoeManualTimer(t.log);
  const marshaller = makeFakeBoard().getPublishingMarshaller();
  const storage = makeFakeStorageKit(
    'fun', // Fast USDC Node
  );
  /**
   * Read pure data (CapData that has no slots) from the storage path
   * @param path
   */
  storage.getDeserialized = (path: string): unknown =>
    storage.getValues(path).map(defaultSerializer.parse);

  const { portAllocator, setupIBCProtocol, ibcBridge } = setupFakeNetwork(
    rootZone.subZone('network'),
    { vowTools },
  );
  await setupIBCProtocol();

  const makeCosmosInterchainService = prepareCosmosInterchainService(
    rootZone.subZone('orchestration'),
    vowTools,
  );
  const cosmosInterchainService = makeCosmosInterchainService({
    portAllocator,
  });

  await registerKnownChains(agoricNamesAdmin, () => {});

  let ibcSequenceNonce = 0n;
  /** simulate incoming message as if the transfer completed over IBC */
  const transmitTransferAck = async () => {
    // assume this is called after each outgoing IBC transfer
    ibcSequenceNonce += 1n;
    // let the promise for the transfer start
    await eventLoopIteration();
    const lastMsgTransfer = localBridgeMessages.at(-1).messages[0];
    await E(transferBridge).fromBridge(
      buildVTransferEvent({
        receiver: lastMsgTransfer.receiver,
        sender: lastMsgTransfer.sender,
        target: lastMsgTransfer.sender,
        sourceChannel: lastMsgTransfer.sourceChannel,
        sequence: ibcSequenceNonce,
        denom: lastMsgTransfer.token.denom,
        amount: BigInt(lastMsgTransfer.token.amount),
      }),
    );
    // let the bridge handler finish
    await eventLoopIteration();
  };

  const chainHub = makeChainHub(
    rootZone.subZone('chainHub'),
    agoricNames,
    vowTools,
  );

  const chainInfo = harden(() => {
    const { agoric, osmosis, noble } = withChainCapabilities(fetchedChainInfo);
    return { agoric, osmosis, noble };
  })();

  const assetInfo: [Denom, DenomDetail & { brandKey?: string }][] = harden([
    assetOn('uusdc', 'noble'),
    [uusdcOnAgoric, agUSDCDetail],
    assetOn('uusdc', 'noble', 'osmosis', fetchedChainInfo),
  ]);

  return {
    bootstrap: {
      agoricNames,
      agoricNamesAdmin,
      bankManager,
      timer,
      localchain,
      cosmosInterchainService,
      // TODO remove; bootstrap doesn't have a zone
      rootZone: rootZone.subZone('contract'),
      storage,
      // TODO remove; bootstrap doesn't have vowTools
      vowTools,
    },
    brands: {
      usdc: usdcSansMint,
    },
    mocks: {
      ibcBridge,
      transferBridge,
    },
    commonPrivateArgs: {
      agoricNames,
      localchain,
      orchestrationService: cosmosInterchainService,
      storageNode: storage.rootNode,
      poolMetricsNode: storage.rootNode.makeChildNode('poolMetrics'),
      marshaller,
      timerService: timer,
      feeConfig: makeTestFeeConfig(usdc),
      chainInfo,
      assetInfo,
    },
    facadeServices: {
      agoricNames,
      /** A chainHub for Exo tests, distinct from the one a contract makes within `withOrchestration` */
      chainHub,
      localchain,
      orchestrationService: cosmosInterchainService,
      timerService: timer,
    },
    utils: {
      pourPayment,
      inspectLocalBridge: () => harden([...localBridgeMessages]),
      inspectDibcBridge: async () => E(ibcBridge).inspectDibcBridge(),
      inspectBankBridge: () => harden([...bankBridgeMessages]),
      transmitTransferAck,
    },
  };
};

export const makeDefaultContext = <SF>(contract: Installation<SF>) => {};

/**
 * Reincarnate without relaxDurabilityRules and provide a durable zone in the incarnation.
 * @param key
 */
export const provideDurableZone = (key: string): Zone => {
  const { fakeVomKit } = reincarnate({ relaxDurabilityRules: false });
  const root = fakeVomKit.cm.provideBaggage();
  const zone = makeDurableZone(root);
  return zone.subZone(key);
};
