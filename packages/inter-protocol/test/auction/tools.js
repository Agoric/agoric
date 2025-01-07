import { Far } from '@endo/marshal';
import { E } from '@endo/eventual-send';
import { makeStoredPublisherKit } from '@agoric/notifier';
import { objectMap, allValues } from '@agoric/internal';
import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';
import { makeFakeMarshaller } from '@agoric/notifier/tools/testSupports.js';
import { GOVERNANCE_STORAGE_KEY } from '@agoric/governance/src/contractHelper.js';
import contractGovernorBundle from '@agoric/governance/bundles/bundle-contractGovernor.js';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';

import { resolve as importMetaResolve } from 'import-meta-resolve';

/**
 * @typedef {{
 *   autoRefund: Installation<
 *     import('@agoric/zoe/src/contracts/automaticRefund.js').start
 *   >;
 *   auctioneer: Installation<import('../../src/auction/auctioneer.js').start>;
 *   governor: Installation<
 *     import('@agoric/governance/src/contractGovernor.js')['start']
 *   >;
 *   reserve: Installation<import('../../src/reserve/assetReserve.js').start>;
 * }} AuctionTestInstallations
 */

/** @param {ZoeService} zoe */
export const setUpInstallations = async zoe => {
  const autoRefund = '@agoric/zoe/src/contracts/automaticRefund.js';
  const autoRefundUrl = await importMetaResolve(autoRefund, import.meta.url);
  const autoRefundPath = new URL(autoRefundUrl).pathname;

  const bundleCache = await unsafeMakeBundleCache('./bundles/'); // package-relative
  const bundles = await allValues({
    // could be called fakeCommittee. It's used as a source of invitations only
    autoRefund: bundleCache.load(autoRefundPath, 'autoRefund'),
    auctioneer: bundleCache.load('./src/auction/auctioneer.js', 'auctioneer'),
    reserve: bundleCache.load('./src/reserve/assetReserve.js', 'reserve'),
    governor: contractGovernorBundle,
  });
  /** @type {AuctionTestInstallations} */
  // @ts-expect-error cast
  const installations = objectMap(bundles, async bundle =>
    E(zoe).install(bundle),
  );
  return installations;
};

export const makeDefaultParams = (invitation, timerBrand) =>
  harden({
    ElectorateInvitationAmount: invitation,
    StartFrequency: 60n,
    ClockStep: 2n,
    StartingRate: 10500n,
    LowestRate: 5500n,
    DiscountStep: 2000n,
    AuctionStartDelay: 10n,
    PriceLockPeriod: 3n,
    TimerBrand: timerBrand,
  });

export const makeFakeAuctioneer = () => {
  const state = { step: 0, final: false, capturedPrices: false };
  const startRounds = [];

  return Far('FakeAuctioneer', {
    reducePriceAndTrade: () => {
      state.step += 1;
    },
    finalize: () => {
      state.final = true;
      state.capturedPrices = false;
    },
    getState: () => state,
    startRound: () => {
      startRounds.push(state.step);
      state.step += 1;
      state.final = false;
    },
    getStartRounds: () => startRounds,
    capturePrices: () => (state.capturedPrices = true),
  });
};

/**
 * contract governor wants a committee invitation. give it a random invitation
 *
 * @param {ZoeService} zoe
 * @param {AuctionTestInstallations} installations
 */
export const getInvitation = async (zoe, installations) => {
  const autoRefundFacets = await E(zoe).startInstance(installations.autoRefund);
  const invitationP = E(autoRefundFacets.publicFacet).makeInvitation();
  const [fakeInvitationPayment, fakeInvitationAmount] = await Promise.all([
    invitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(invitationP),
  ]);
  return { fakeInvitationPayment, fakeInvitationAmount };
};

/** @returns {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} */
export const makeGovernancePublisherFromFakes = () => {
  const storageRoot = makeMockChainStorageRoot();

  return makeStoredPublisherKit(
    storageRoot,
    makeFakeMarshaller(),
    GOVERNANCE_STORAGE_KEY,
  );
};
