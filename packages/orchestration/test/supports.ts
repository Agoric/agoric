import { makeIssuerKit } from '@agoric/ertp';
import { VTRANSFER_IBC_EVENT } from '@agoric/internal/src/action-types.js';
import { makeFakeStorageKit } from '@agoric/internal/src/storage-test-utils.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
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
import { makeHeapZone } from '@agoric/zone';
import { E } from '@endo/far';
import type { ExecutionContext } from 'ava';
import { registerKnownChains } from '../src/chain-info.js';
import { makeChainHub } from '../src/exos/chain-hub.js';
import { prepareCosmosInterchainService } from '../src/exos/cosmos-interchain-service.js';
import fetchedChainInfo from '../src/fetched-chain-info.js';
import { buildVTransferEvent } from '../tools/ibc-mocks.js';
import { setupFakeNetwork } from './network-fakes.js';
import { denomHash } from '../src/utils/denomHash.js';
import { withChainCapabilities } from '../src/chain-capabilities.js';

export {
  makeFakeLocalchainBridge,
  makeFakeTransferBridge,
} from '@agoric/vats/tools/fake-bridge.js';

const usdcOnAgoric = `ibc/${denomHash({
  channelId:
    fetchedChainInfo.agoric.connections['noble-1'].transferChannel.channelId,
  denom: 'uusdc',
})}`;

const atomOnAgoric = `ibc/${denomHash({
  channelId:
    fetchedChainInfo.agoric.connections['cosmoshub-4'].transferChannel
      .channelId,
  denom: 'uatom',
})}`;

const usdcOnDydx = `ibc/${denomHash({
  channelId:
    fetchedChainInfo.dydx.connections['noble-1'].transferChannel.channelId,
  denom: 'uusdc',
})}`;

export const commonSetup = async (t: ExecutionContext<any>) => {
  t.log('bootstrap vat dependencies');
  // The common setup cannot support a durable zone because many of the fakes are not durable.
  // They were made before we had durable kinds (and thus don't take a zone or baggage).
  // To test durability in unit tests, test a particular entity with `relaxDurabilityRules: false`.
  // To test durability integrating multiple vats, use a RunUtils/bootstrap test.
  const rootZone = makeHeapZone();

  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();

  const bld = withAmountUtils(makeIssuerKit('BLD'));
  const ist = withAmountUtils(makeIssuerKit('IST'));
  const usdc = withAmountUtils(makeIssuerKit('USDC'));
  const bankBridgeMessages = [] as any[];
  const { bankManager, pourPayment } = await makeFakeBankManagerKit({
    onToBridge: obj => bankBridgeMessages.push(obj),
  });
  await E(bankManager).addAsset('ubld', 'BLD', 'Staking Token', bld.issuerKit);
  await E(bankManager).addAsset(
    'uist',
    'IST',
    'Inter Stable Token',
    ist.issuerKit,
  );
  await E(bankManager).addAsset(
    usdcOnAgoric,
    'USDC',
    'USD Coin',
    usdc.issuerKit,
  );
  // These mints no longer stay in sync with bankManager.
  // Use pourPayment() for IST.
  const { mint: _b, ...bldSansMint } = bld;
  const { mint: _i, ...istSansMint } = ist;
  const { mint: _u, ...usdcSansMint } = usdc;
  // XXX real bankManager does this. fake should too?
  // TODO https://github.com/Agoric/agoric-sdk/issues/9966
  await makeWellKnownSpaces(agoricNamesAdmin, t.log, ['vbankAsset']);
  await E(E(agoricNamesAdmin).lookupAdmin('vbankAsset')).update(
    'uist',
    /** @type {AssetInfo} */ harden({
      brand: ist.brand,
      issuer: ist.issuer,
      issuerName: 'IST',
      denom: 'uist',
      proposedName: 'IST',
      displayInfo: { IOU: true },
    }),
  );
  await E(E(agoricNamesAdmin).lookupAdmin('vbankAsset')).update(
    'ubld',
    /** @type {AssetInfo} */ harden({
      brand: bld.brand,
      issuer: bld.issuer,
      issuerName: 'BLD',
      denom: 'ubld',
      proposedName: 'BLD',
      displayInfo: { IOU: true },
    }),
  );
  await E(E(agoricNamesAdmin).lookupAdmin('vbankAsset')).update(
    usdcOnAgoric,
    /** @type {AssetInfo} */ harden({
      brand: usdc.brand,
      issuer: usdc.issuer,
      issuerName: 'USDC',
      denom: usdcOnAgoric,
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
  const localchainBridge = makeFakeLocalchainBridge(rootZone, obj =>
    localBridgeMessages.push(obj),
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
  const marshaller = makeFakeBoard().getReadonlyMarshaller();
  const storage = makeFakeStorageKit('mockChainStorageRoot', {
    sequence: false,
  });

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

  // add `pfmEnabled` to chainInfo
  const chainInfoWithCaps = withChainCapabilities(fetchedChainInfo);

  // for registration with `ChainHub`
  const commonAssetInfo = harden({
    ubld: {
      chainName: 'agoric',
      baseName: 'agoric',
      baseDenom: 'ubld',
      brand: bld.brand,
    },
    uist: {
      chainName: 'agoric',
      baseName: 'agoric',
      baseDenom: 'uist',
      brand: ist.brand,
    },
    uusdc: {
      chainName: 'noble',
      baseName: 'noble',
      baseDenom: 'uusdc',
    },
    [usdcOnAgoric]: {
      chainName: 'agoric',
      baseName: 'noble',
      baseDenom: 'uusdc',
      brand: usdc.brand,
    },
    [atomOnAgoric]: {
      chainName: 'agoric',
      baseName: 'cosmoshub',
      baseDenom: 'uatom',
    },
    [usdcOnDydx]: {
      chainName: 'dydx',
      baseName: 'noble',
      baseDenom: 'uusdc',
    },
  });

  /**
   * Register BLD if it's not already registered for exo unit tests.
   *
   * For contract tests with contracts that use `withOrchestration`, access
   * `chainInfo` and `assetInfo` from `commonPrivateArgs` and register in the
   * contract's ChainHub with `registerChainsAndAssets`.
   */
  const registerAgoricAssets = () => {
    if (!chainHub.getAsset('ubld')) {
      chainHub.registerChain('agoric', chainInfoWithCaps.agoric);
      chainHub.registerAsset('ubld', commonAssetInfo.ubld);
    }
    if (!chainHub.getAsset('uist')) {
      chainHub.registerAsset('uist', commonAssetInfo.uist);
    }
  };

  const registerUSDC = () => {
    if (!chainHub.getAsset('uusdc')) {
      chainHub.registerChain('noble', chainInfoWithCaps.noble);
      chainHub.registerAsset('uusdc', commonAssetInfo.uusdc);
    }
    if (!chainHub.getAsset(usdcOnAgoric)) {
      chainHub.registerAsset(usdcOnAgoric, commonAssetInfo[usdcOnAgoric]);
    }
    if (!chainHub.getAsset(usdcOnDydx)) {
      chainHub.registerChain('dydx', chainInfoWithCaps.dydx);
      chainHub.registerAsset(usdcOnDydx, commonAssetInfo[usdcOnDydx]);
    }
  };

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
      bld: bldSansMint,
      ist: istSansMint,
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
      marshaller,
      timerService: timer,
      chainInfo: withChainCapabilities(fetchedChainInfo),
      assetInfo: harden(commonAssetInfo),
    },
    facadeServices: {
      agoricNames,
      chainHub,
      localchain,
      orchestrationService: cosmosInterchainService,
      timerService: timer,
    },
    utils: {
      pourPayment,
      inspectLocalBridge: () => harden([...localBridgeMessages]),
      inspectDibcBridge: () => E(ibcBridge).inspectDibcBridge(),
      inspectBankBridge: () => harden([...bankBridgeMessages]),
      registerAgoricAssets,
      registerUSDC,
      transmitTransferAck,
    },
  };
};

export const makeDefaultContext = <SF>(contract: Installation<SF>) => {};
