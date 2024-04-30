import { makeMap } from 'jessie.js';
import { E, Far } from '@endo/far';
import { deeplyFulfilled } from '@endo/marshal';
import { makeTracer, VBankAccount } from '@agoric/internal';
import { AmountMath } from '@agoric/ertp';
import { ParamTypes } from '@agoric/governance';
import { makeStorageNodeChild } from '@agoric/internal/src/lib-chainStorage.js';
import { Stable } from '@agoric/internal/src/tokens.js';
import {
  makeHistoryReviver,
  makeBoardRemote,
  slotToBoardRemote,
} from '../../tools/board-utils.js';

const trace = makeTracer('StartWF');

/**
 * @param {ERef<ZoeService>} zoe
 * @param {Installation<
 *   import('@agoric/smart-wallet/src/walletFactory.js').start
 * >} inst
 *
 * @typedef {Awaited<ReturnType<typeof startFactoryInstance>>} WalletFactoryStartResult
 */
// eslint-disable-next-line no-unused-vars
const startFactoryInstance = (zoe, inst) => E(zoe).startInstance(inst);

const StableUnit = BigInt(10 ** Stable.displayInfo.decimalPlaces);

/**
 * Publish an arbitrary wallet state so that clients can tell that a wallet has
 * been provisioned.
 *
 * @param {string[]} oldAddresses
 * @param {Marshaller} marshaller
 * @param {StorageNode} walletStorageNode
 */
const publishRevivableWalletState = async (
  oldAddresses,
  marshaller,
  walletStorageNode,
) => {
  const arbData = harden({});
  const arbMarshalled = await E(marshaller).serialize(arbData);
  const arbJSON = JSON.stringify(arbMarshalled);
  const publishArbitraryWalletState = async address => {
    const walletUpdateNode = makeStorageNodeChild(walletStorageNode, address);
    const walletCurrentNode = makeStorageNodeChild(walletUpdateNode, 'current');
    await Promise.all([
      E(walletUpdateNode).setValue(arbJSON),
      E(walletCurrentNode).setValue(arbJSON),
    ]);
  };
  await Promise.all(oldAddresses.map(publishArbitraryWalletState));
};

/**
 * Register for PLEASE_PROVISION bridge messages and handle them by providing a
 * smart wallet from the wallet factory.
 *
 * @param {BootstrapPowers &
 *   ChainStorageVatParams &
 *   PromiseSpaceOf<{
 *     economicCommitteeCreatorFacet: import('@agoric/governance/src/committee.js').CommitteeElectorateCreatorFacet;
 *     econCharterKit: {
 *       creatorFacet: Awaited<
 *         ReturnType<
 *           import('@agoric/inter-protocol/src/econCommitteeCharter.js')['start']
 *         >
 *       >['creatorFacet'];
 *       adminFacet: AdminFacet<
 *         import('@agoric/inter-protocol/src/econCommitteeCharter.js')['start']
 *       >;
 *     };
 *     walletBridgeManager: import('../types.js').ScopedBridgeManager;
 *     provisionWalletBridgeManager: import('../types.js').ScopedBridgeManager;
 *   }>} powers
 * @param {{
 *   options?: {
 *     perAccountInitialValue?: bigint;
 *   };
 * }} [config]
 */
export const startWalletFactory = async (
  {
    vatParameters: { chainStorageEntries = [] },
    consume: {
      agoricNames,
      bankManager,
      board,
      walletBridgeManager: walletBridgeManagerP,
      provisionWalletBridgeManager: provisionWalletBridgeManagerP,
      chainStorage,
      namesByAddressAdmin: namesByAddressAdminP,
      econCharterKit,
      startUpgradable,
      startGovernedUpgradable,
    },
    produce: { client, walletFactoryStartResult, provisionPoolStartResult },
    installation: {
      consume: { walletFactory, provisionPool },
    },
    instance: { produce: instanceProduce },
    brand: {
      consume: { [Stable.symbol]: feeBrandP },
    },
    issuer: {
      consume: { [Stable.symbol]: feeIssuerP },
    },
  },
  { options: { perAccountInitialValue = (StableUnit * 25n) / 100n } = {} } = {},
) => {
  // The wallet path is read by the cosmos side to check provisioning
  // See `WalletStoragePathSegment` and `GetSmartWalletState` in
  // golang/cosmos/x/swingset/keeper/keeper.go
  const WALLET_STORAGE_PATH_SEGMENT = 'wallet';
  const POOL_STORAGE_PATH_SEGMENT = 'provisionPool';
  const OLD_WALLET_STORAGE_PATH = 'published.wallet';
  const OLD_POOL_METRICS_STORAGE_PATH = 'published.provisionPool.metrics';
  const [walletBridgeManager, provisionWalletBridgeManager, poolAddr] =
    await Promise.all([
      walletBridgeManagerP,
      provisionWalletBridgeManagerP,
      E(bankManager).getModuleAccountAddress(VBankAccount.provision.module),
    ]);
  if (!walletBridgeManager || !provisionWalletBridgeManager) {
    console.warn(
      'startWalletFactory needs wallet and provision bridgeManagers (not sim chain)',
    );
    return;
  }
  trace('provision pool', { poolAddr });
  if (!poolAddr) {
    trace(
      'ERROR: startWalletFactory needs vbank/provision module address (not sim chain)',
    );
    return;
  }
  const [
    walletStorageNode,
    poolStorageNode,
    namesByAddressAdmin,
    feeBrand,
    feeIssuer,
  ] = await Promise.all([
    makeStorageNodeChild(chainStorage, WALLET_STORAGE_PATH_SEGMENT),
    makeStorageNodeChild(chainStorage, POOL_STORAGE_PATH_SEGMENT),
    namesByAddressAdminP,
    feeBrandP,
    feeIssuerP,
  ]);

  // Restore metrics with updated brand references.
  const dataReviver = makeHistoryReviver(
    chainStorageEntries,
    slotToBoardRemote,
  );

  const reviveOldMetrics = () => {
    if (!dataReviver.has(OLD_POOL_METRICS_STORAGE_PATH)) {
      return undefined;
    }
    const oldPoolMetrics = dataReviver.getItem(OLD_POOL_METRICS_STORAGE_PATH);
    const newBrandFromOldSlotID = makeMap([
      [oldPoolMetrics.totalMintedProvided.brand.getBoardId(), feeBrand],
    ]);
    const brandReviver = makeHistoryReviver(
      chainStorageEntries,
      (slotID, iface) => {
        const newBrand = newBrandFromOldSlotID.get(slotID);
        return newBrand || makeBoardRemote({ boardId: slotID, iface });
      },
    );
    return brandReviver.getItem(OLD_POOL_METRICS_STORAGE_PATH);
  };

  // Carry forward wallets with an address already in chain storage.
  const oldAddresses = dataReviver.children(`${OLD_WALLET_STORAGE_PATH}.`);

  const marshaller = await E(board).getPublishingMarshaller();
  const poolBank = E(bankManager).getBankForAddress(poolAddr);
  const ppFacets = await E(startGovernedUpgradable)({
    installation: provisionPool,
    terms: {},
    privateArgs: harden({
      poolBank,
      storageNode: poolStorageNode,
      marshaller,
      metricsOverride: reviveOldMetrics(),
    }),
    label: 'provisionPool',
    governedParams: {
      PerAccountInitialAmount: {
        type: ParamTypes.AMOUNT,
        value: AmountMath.make(feeBrand, perAccountInitialValue),
      },
    },
  });
  provisionPoolStartResult.resolve(ppFacets);
  instanceProduce.provisionPool.resolve(ppFacets.instance);

  const terms = await deeplyFulfilled(
    harden({
      agoricNames,
      board,
      // TODO(#5885): vbank should provide a facet attenuated
      // to only provide getAssetSubscription
      // meanwhile, expose the whole poolBank rather than
      // adding a bootstrap export.
      assetPublisher: poolBank,
    }),
  );

  const wfFacets = await E(startUpgradable)({
    installation: walletFactory,
    issuerKeywordRecord: { Fee: feeIssuer },
    terms,
    privateArgs: {
      storageNode: walletStorageNode,
      walletBridgeManager,
      walletReviver: E(ppFacets.creatorFacet).getWalletReviver(),
    },
    label: 'walletFactory',
  });
  walletFactoryStartResult.resolve(wfFacets);
  instanceProduce.walletFactory.resolve(wfFacets.instance);

  await Promise.all([
    E(ppFacets.creatorFacet).addRevivableAddresses(oldAddresses),
    E(ppFacets.creatorFacet).setReferences({
      bankManager,
      namesByAddressAdmin,
      walletFactory: wfFacets.creatorFacet,
    }),
    publishRevivableWalletState(oldAddresses, marshaller, walletStorageNode),
  ]);
  const bridgeHandler = await E(ppFacets.creatorFacet).makeHandler();

  await Promise.all([
    E(provisionWalletBridgeManager).initHandler(bridgeHandler),
    E(E.get(econCharterKit).creatorFacet).addInstance(
      ppFacets.instance,
      ppFacets.governorCreatorFacet,
      'provisionPool',
    ),
  ]);

  // TODO: move to its own producer, omitted in some configurations
  client.resolve(
    Far('dummy client', {
      assignBundle: (propertyMakers = []) => {
        console.warn(
          'dummy mailbox client home: ignoring',
          propertyMakers.length,
          'propertyMakers',
        );
      },
    }),
  );
};

export const WALLET_FACTORY_MANIFEST = {
  [startWalletFactory.name]: {
    vatParameters: { chainStorageEntries: true },
    consume: {
      agoricNames: true,
      bankManager: 'bank',
      board: 'board',
      walletBridgeManager: true,
      provisionWalletBridgeManager: true,
      chainStorage: 'bridge',
      namesByAddressAdmin: true,
      startUpgradable: true,
      startGovernedUpgradable: true,
      econCharterKit: 'psmCharter',
    },
    produce: {
      client: true, // dummy client in this configuration
      walletFactoryStartResult: true,
      provisionPoolStartResult: true,
    },
    installation: {
      consume: {
        walletFactory: 'zoe',
        provisionPool: 'zoe',
      },
    },
    brand: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    issuer: {
      consume: { [Stable.symbol]: 'zoe' },
    },
    instance: {
      produce: {
        provisionPool: 'provisionPool',
        walletFactory: 'walletFactory',
      },
    },
  },
};

export const getManifestForWalletFactory = (
  { restoreRef },
  { installKeys },
) => {
  return {
    manifest: WALLET_FACTORY_MANIFEST,
    installations: {
      provisionPool: restoreRef(installKeys.provisionPool),
      walletFactory: restoreRef(installKeys.walletFactory),
    },
  };
};
