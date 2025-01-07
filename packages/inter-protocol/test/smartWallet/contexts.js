import { BridgeId, deeplyFulfilledObject } from '@agoric/internal';
import { makeStorageNodeChild } from '@agoric/internal/src/lib-chainStorage.js';
import { coalesceUpdates } from '@agoric/smart-wallet/src/utils.js';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import {
  produceStartUpgradable,
  produceStartGovernedUpgradable,
  produceDiagnostics,
} from '@agoric/vats/src/core/basic-behaviors.js';
import { makeHeapZone } from '@agoric/zone';
import { E } from '@endo/far';
import path from 'path';
import { makeScopedBridge } from '@agoric/vats';
import { oracleBrandFeedName } from '../../src/proposals/utils.js';
import { createPriceFeed } from '../../src/proposals/price-feed-proposal.js';
import { withAmountUtils } from '../supports.js';

// referenced by TS
coalesceUpdates;

const bundlesToCache = harden({
  psm: './src/psm/psm.js',
  econCommitteeCharter: './src/econCommitteeCharter.js',
});

export const importBootTestUtils = async (log, bundleCache) => {
  // Preload the cache entries needed by boot-test-utils.js.
  await Promise.all(
    Object.entries(bundlesToCache).map(async ([name, entrypoint]) =>
      bundleCache.validateOrAdd(entrypoint, name),
    ),
  );
  const utils = await import('./boot-test-utils.js');
  const mockPsmBootstrapArgs = () => {
    const mock = utils.makeMock(log);
    const vats = utils.mockSwingsetVats(mock);
    return [vats, mock.devices];
  };
  return { ...utils, mockPsmBootstrapArgs };
};

/**
 * @param {import('ava').ExecutionContext} t
 * @param {(logger, cache) => Promise<ChainBootstrapSpace>} makeSpace
 */
export const makeDefaultTestContext = async (t, makeSpace) => {
  // To debug, pass t.log instead of null logger
  const log = () => null;

  const bundleCache = await unsafeMakeBundleCache('bundles/');
  const zone = makeHeapZone();

  // @ts-expect-error xxx
  const { consume, produce, instance } = await makeSpace(log, bundleCache);
  const { agoricNames, zoe } = consume;

  await produceDiagnostics({ produce });
  // @ts-expect-error Doesnt actually require all bootstrap powers
  await produceDiagnostics({ consume, produce });
  // @ts-expect-error Doesnt actually require all bootstrap powers
  await produceStartUpgradable({ zone, consume, produce });

  //#region Installs
  const pathname = new URL(import.meta.url).pathname;
  const dirname = path.dirname(pathname);

  const bundle = await bundleCache.load(
    `${dirname}/../../../smart-wallet/src/walletFactory.js`,
    'walletFactory',
  );
  /**
   * @type {Promise<
   *   Installation<import('@agoric/smart-wallet/src/walletFactory.js').start>
   * >}
   */
  const installation = E(zoe).install(bundle);

  const contractGovernorBundle = await bundleCache.load(
    `${dirname}/../../../governance/src/contractGovernor.js`,
    'contractGovernor',
  );

  const contractGovernor = E(zoe).install(contractGovernorBundle);
  //#endregion

  await produceStartGovernedUpgradable({
    // @ts-expect-error Doesnt actually require all bootstrap powers
    consume,
    // @ts-expect-error Doesnt actually require all bootstrap powers
    produce,
    zone,
    installation: {
      // @ts-expect-error Doesnt actually require all bootstrap powers
      consume: { contractGovernor },
    },
  });

  // copied from makeClientBanks()
  const storageNode = await makeStorageNodeChild(
    consume.chainStorage,
    'wallet',
  );

  const assetPublisher = await E(consume.bankManager).getBankForAddress(
    'anyAddress',
  );
  const bridgeManager = await consume.bridgeManager;
  /**
   * @type {undefined
   *   | import('@agoric/vats').ScopedBridgeManager<'wallet'>}
   */
  const walletBridgeManager = await (bridgeManager &&
    makeScopedBridge(bridgeManager, BridgeId.WALLET));

  const customTerms = await deeplyFulfilledObject(
    harden({
      agoricNames, // may be a promise
      board: consume.board, // may be a promise
      assetPublisher,
    }),
  );

  const walletFactory = await E(zoe).startInstance(
    installation,
    {},
    customTerms,
    { storageNode, walletBridgeManager },
  );

  /**
   * Each test should have its own wallet to prevent leaking state between them
   *
   * @param {string} address
   */
  const provideWalletAndBalances = async address => {
    // copied from makeClientBanks()
    const bank = await E(consume.bankManager).getBankForAddress(address);

    const [wallet, _isNew] = await E(
      walletFactory.creatorFacet,
    ).provideSmartWallet(address, bank, consume.namesByAddressAdmin);

    /**
     * Read-only facet of bank
     *
     * @param {Brand<'nat'>} brand
     */
    const getBalanceFor = async brand =>
      E(E(bank).getPurse(brand)).getCurrentAmount();
    return { getBalanceFor, wallet };
  };

  const simpleProvideWallet = async address =>
    provideWalletAndBalances(address).then(({ wallet }) => wallet);

  /**
   * @param {string[]} oracleAddresses
   * @param {string} inBrandName
   * @param {string} outBrandName
   */
  const simpleCreatePriceFeed = async (
    oracleAddresses,
    inBrandName = 'ATOM',
    outBrandName = 'USD',
  ) => {
    // copied from coreProposalBehavior: Publish the installations for behavior dependencies.
    /** @type {ERef<import('@agoric/vats').NameAdmin>} */
    const installAdmin = E(consume.agoricNamesAdmin).lookupAdmin(
      'installation',
    );
    const paBundle = await bundleCache.load(
      '../inter-protocol/src/price/fluxAggregatorContract.js',
      'priceAggregator',
    );
    /**
     * @type {Promise<
     *   Installation<
     *     import('@agoric/inter-protocol/src/price/fluxAggregatorContract.js').start
     *   >
     * >}
     */
    const paInstallation = E(zoe).install(paBundle);
    await E(installAdmin).update('priceAggregator', paInstallation);

    const mockPriceAuthorityAdmin = /** @type {any} */ ({
      registerPriceAuthority() {
        // noop mock
      },
    });
    produce.priceAuthorityAdmin.resolve(mockPriceAuthorityAdmin);

    await createPriceFeed(
      // @ts-expect-error xxx
      { consume, produce, instance },
      {
        options: {
          priceFeedOptions: {
            AGORIC_INSTANCE_NAME: oracleBrandFeedName(
              inBrandName,
              outBrandName,
            ),
            contractTerms: {
              minSubmissionCount: 2,
              minSubmissionValue: 1,
              maxSubmissionCount: 5,
              maxSubmissionValue: 99999,
              restartDelay: 1n,
              timeout: 10,
            },
            oracleAddresses,
            IN_BRAND_NAME: inBrandName,
            OUT_BRAND_NAME: outBrandName,
          },
        },
      },
    );
  };

  const anchor = withAmountUtils(
    // @ts-expect-error xxx type debt
    await deeplyFulfilledObject(consume.testFirstAnchorKit),
  );

  return {
    anchor,
    invitationBrand: await E(E(zoe).getInvitationIssuer()).getBrand(),
    sendToBridge:
      walletBridgeManager &&
      (async obj => E(walletBridgeManager).toBridge(obj)),
    consume,
    provideWalletAndBalances,
    simpleProvideWallet,
    simpleCreatePriceFeed,
  };
};

/**
 * @param {import('@agoric/smart-wallet/src/smartWallet.js').CurrentWalletRecord} record
 * @param {Brand<'nat'>} brand
 */
export const currentPurseBalance = (record, brand) => {
  const purses = Array.from(record.purses.values());
  const match = purses.find(b => b.brand === brand);
  if (!match) {
    console.debug('purses', ...purses);
    assert.fail(`${brand} not found in record`);
  }
  return match.balance.value;
};

/**
 * Voting yes (first position) on the one open question using the continuing
 * offer.
 *
 * @param {ERef<CommitteeElectoratePublic>} committeePublic
 * @param {string} voterAcceptanceOID
 * @returns {Promise<
 *   import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec
 * >}
 */
export const voteForOpenQuestion = async (
  committeePublic,
  voterAcceptanceOID,
) => {
  const questions = await E(committeePublic).getOpenQuestions();
  assert.equal(questions.length, 1);
  const question = E(committeePublic).getQuestion(questions[0]);
  const { positions, questionHandle } = await E(question).getDetails();
  const yesPosition = harden([positions[0]]);

  /** @type {import('@agoric/smart-wallet/src/invitations.js').ContinuingInvitationSpec} */
  const getVoteSpec = {
    source: 'continuing',
    previousOffer: voterAcceptanceOID,
    invitationMakerName: 'makeVoteInvitation',
    invitationArgs: harden([yesPosition, questionHandle]),
  };

  return getVoteSpec;
};
