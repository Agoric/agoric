// @jessie-check

import { makeMap } from 'jessie.js';
import { X } from '@endo/errors';
import { E } from '@endo/far';
import { AmountMath, AssetKind } from '@agoric/ertp';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import { makeStorageNodeChild } from '@agoric/internal/src/lib-chainStorage.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import {
  makeHistoryReviver,
  makeBoardRemote,
  slotToBoardRemote,
} from '@agoric/internal/src/marshal.js';
import { deeplyFulfilledObject } from '@agoric/internal';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { Stable } from '@agoric/internal/src/tokens.js';

import { reserveThenGetNamePaths } from './utils.js';

import {
  inviteCommitteeMembers,
  startEconCharter,
  inviteToEconCharter,
} from './committee-proposal.js';

/** @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js' */
/** @import {MetricsNotification} from '../psm/psm.js' */
/** @import {EconomyBootstrapPowers} from './econ-behaviors.js' */

const BASIS_POINTS = 10000n;

export { inviteCommitteeMembers, startEconCharter, inviteToEconCharter };

const stablePsmKey = `published.psm.${Stable.symbol}`;

/**
 * @param {[key: string, value: string][]} chainStorageEntries
 * @param {string} keyword
 * @param {{ minted: Brand<'nat'>; anchor: Brand<'nat'> }} brands
 * @returns {{
 *   metrics?: MetricsNotification;
 *   governance?: GovernanceSubscriptionState;
 * }}
 */
const findOldPSMState = (chainStorageEntries, keyword, brands) => {
  // In this reviver, object references are revived as boardIDs
  // from the pre-bulldozer board.
  const toSlotReviver = makeHistoryReviver(
    chainStorageEntries,
    slotToBoardRemote,
  );
  if (!toSlotReviver.has(`${stablePsmKey}.${keyword}.metrics`)) {
    return {};
  }
  const metricsWithOldBoardIDs = toSlotReviver.getItem(
    `${stablePsmKey}.${keyword}.metrics`,
  );
  const oldIDtoNewBrand = makeMap([
    [metricsWithOldBoardIDs.feePoolBalance.brand.getBoardId(), brands.minted],
    [
      metricsWithOldBoardIDs.anchorPoolBalance.brand.getBoardId(),
      brands.anchor,
    ],
  ]);
  // revive brands; other object references map to dummy remotables
  const brandReviver = makeHistoryReviver(
    chainStorageEntries,
    (slotID, iface) => {
      const newBrand = oldIDtoNewBrand.get(slotID);
      return newBrand || makeBoardRemote({ boardId: slotID, iface });
    },
  );
  return {
    metrics: brandReviver.getItem(`${stablePsmKey}.${keyword}.metrics`),
    governance: brandReviver.getItem(`${stablePsmKey}.${keyword}.governance`),
  };
};

/**
 * @param {EconomyBootstrapPowers & WellKnownSpaces & ChainStorageVatParams} powers
 * @param {object} [config]
 * @param {bigint} [config.WantMintedFeeBP]
 * @param {bigint} [config.GiveMintedFeeBP]
 * @param {bigint} [config.MINT_LIMIT]
 * @param {{ anchorOptions?: AnchorOptions }} [config.options]
 */
export const startPSM = async (
  {
    vatParameters: { chainStorageEntries = [] },
    consume: {
      agoricNamesAdmin,
      board,
      diagnostics,
      zoe,
      feeMintAccess: feeMintAccessP,
      economicCommitteeCreatorFacet,
      econCharterKit,
      provisionPoolStartResult,
      chainStorage,
      chainTimerService,
      psmKit,
      anchorBalancePayments: anchorBalancePaymentsP,
    },
    produce: { psmKit: producepsmKit },
    installation: {
      consume: { contractGovernor, psm: psmInstall },
    },
    brand: {
      consume: { [Stable.symbol]: mintedP },
    },
  },
  {
    options: { anchorOptions = {} } = {},
    WantMintedFeeBP = 0n,
    GiveMintedFeeBP = 0n,
    MINT_LIMIT = 1_000n * 1_000_000n,
  } = {},
) => {
  const { denom, keyword = 'AUSD' } = anchorOptions;
  assert.typeof(
    denom,
    'string',
    X`anchorOptions.denom must be a string, not ${denom}`,
  );
  /** @type {[Brand<'nat'>, [Brand<'nat'>, Issuer<'nat'>], FeeMintAccess]} */
  // @ts-expect-error cast
  const [minted, [anchorBrand, anchorIssuer], feeMintAccess] =
    await Promise.all([
      mintedP,
      reserveThenGetNamePaths(agoricNamesAdmin, [
        ['brand', keyword],
        ['issuer', keyword],
      ]),
      feeMintAccessP,
    ]);

  const poserInvitationP = E(
    economicCommitteeCreatorFacet,
  ).getPoserInvitation();
  const [initialPoserInvitation, electorateInvitationAmount] =
    await Promise.all([
      poserInvitationP,
      E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
    ]);

  const [anchorInfo, mintedInfo] = await Promise.all(
    [anchorBrand, minted].map(async b => E(b).getDisplayInfo()),
  );

  const mintLimit = AmountMath.make(minted, MINT_LIMIT);
  const anchorDecimalPlaces = anchorInfo.decimalPlaces || 1n;
  const mintedDecimalPlaces = mintedInfo.decimalPlaces || 1n;

  const oldState = findOldPSMState(chainStorageEntries, keyword, {
    minted,
    anchor: anchorBrand,
  });

  const terms = await deeplyFulfilledObject(
    harden({
      anchorBrand,
      anchorPerMinted: makeRatio(
        10n ** BigInt(anchorDecimalPlaces),
        anchorBrand,
        10n ** BigInt(mintedDecimalPlaces),
        minted,
      ),
      governedParams: {
        WantMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(WantMintedFeeBP, minted, BASIS_POINTS),
        },
        GiveMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(GiveMintedFeeBP, minted, BASIS_POINTS),
        },
        MintLimit: { type: ParamTypes.AMOUNT, value: mintLimit },
        // Override numeric config values from restored state.
        ...oldState.governance?.current,
        // Don't override the invitation amount;
        // the electorate is re-constituted rather than restored.
        [CONTRACT_ELECTORATE]: {
          type: ParamTypes.INVITATION,
          value: electorateInvitationAmount,
        },
      },
    }),
  );

  const psmStorageNode = await makeStorageNodeChild(chainStorage, 'psm');
  const storageNode = await E(
    E(psmStorageNode).makeChildNode(Stable.symbol),
  ).makeChildNode(keyword);

  const marshaller = await E(board).getPublishingMarshaller();

  const instanceKey = `psm-${Stable.symbol}-${keyword}`;
  const governorTerms = await deeplyFulfilledObject(
    harden({
      timer: chainTimerService,
      governedContractInstallation: psmInstall,
      governed: {
        terms,
        issuerKeywordRecord: { [keyword]: anchorIssuer },
        label: instanceKey,
      },
    }),
  );
  const psmPrivateArgs = {
    feeMintAccess,
    initialPoserInvitation,
    marshaller,
    storageNode,
  };
  /** @type {GovernorStartedInstallationKit<typeof psmInstall>} */
  const governorFacets = await E(zoe).startInstance(
    contractGovernor,
    {},
    governorTerms,
    harden({
      economicCommitteeCreatorFacet,
      governed: psmPrivateArgs,
    }),
    `${instanceKey}.governor`,
  );

  const [psm, psmCreatorFacet, psmAdminFacet] = await Promise.all([
    E(governorFacets.creatorFacet).getInstance(),
    E(governorFacets.creatorFacet).getCreatorFacet(),
    E(governorFacets.creatorFacet).getAdminFacet(),
  ]);
  await E(diagnostics).savePrivateArgs(psm, psmPrivateArgs);

  /** @param {MetricsNotification} metrics */
  const restoreMetrics = async metrics => {
    const anchorBalancePayments = await anchorBalancePaymentsP;
    const anchorPmt = anchorBalancePayments.get(anchorBrand);

    const { anchorPoolBalance: _a, ...nonPaymentMetrics } = metrics;

    const seat = E(zoe).offer(
      E(psmCreatorFacet).makeRestoreMetricsInvitation(),
      harden({ give: { Anchor: metrics.anchorPoolBalance } }),
      harden({ Anchor: anchorPmt }),
      harden(nonPaymentMetrics),
    );
    await E(seat).getPayouts();
  };
  await (oldState.metrics && restoreMetrics(oldState.metrics));

  /** @type {import('./econ-behaviors.js').PSMKit} */
  const newpsmKit = harden({
    label: instanceKey,
    psm,
    psmGovernor: governorFacets.instance,
    psmCreatorFacet,
    psmAdminFacet,
    psmGovernorCreatorFacet: governorFacets.creatorFacet,
  });

  // Provide pattern with a promise.
  producepsmKit.resolve(makeScalarBigMapStore('PSM Kits', { durable: true }));

  /** @type {MapStore<Brand, import('./econ-behaviors.js').PSMKit>} */
  const psmKitMap = await psmKit;

  // TODO init into governedContractKits too to simplify testing
  psmKitMap.init(anchorBrand, newpsmKit);
  const instanceAdmin = E(agoricNamesAdmin).lookupAdmin('instance');

  await Promise.all([
    E(instanceAdmin).update(instanceKey, newpsmKit.psm),
    E(E.get(econCharterKit).creatorFacet).addInstance(
      psm,
      governorFacets.creatorFacet,
      instanceKey,
    ),
    E(E.get(provisionPoolStartResult).creatorFacet).initPSM(
      anchorBrand,
      newpsmKit.psm,
    ),
  ]);
};
harden(startPSM);

/**
 * @typedef {object} AnchorOptions
 * @property {string} [denom]
 * @property {string} [keyword]
 * @property {number} [decimalPlaces]
 * @property {string} [proposedName]
 */

/**
 * Make anchor issuer out of a Cosmos asset; presumably USDC over IBC. Add it to
 * BankManager.
 *
 * Also, if vatParameters shows an anchorPoolBalance for this asset, mint a
 * payment for that balance.
 *
 * TODO: address redundancy with publishInterchainAssetFromBank
 *
 * @param {EconomyBootstrapPowers & WellKnownSpaces & ChainStorageVatParams} powers
 * @param {{ options: { anchorOptions?: AnchorOptions } }} config
 */
export const makeAnchorAsset = async (
  {
    vatParameters: { chainStorageEntries = [] },
    consume: {
      agoricNamesAdmin,
      bankManager,
      startUpgradable,
      anchorBalancePayments,
    },
    installation: {
      consume: { mintHolder },
    },
    produce: {
      testFirstAnchorKit,
      anchorBalancePayments: produceAnchorBalancePayments,
    },
  },
  { options: { anchorOptions = {} } = {} },
) => {
  assert.typeof(anchorOptions, 'object', X`${anchorOptions} must be an object`);
  const {
    denom,
    keyword = 'AUSD',
    decimalPlaces = 6,
    proposedName = 'AUSD',
  } = anchorOptions;
  assert.typeof(
    denom,
    'string',
    X`anchorOptions.denom must be a string, not ${denom}`,
  );

  const terms = await deeplyFulfilledObject(
    harden({
      keyword,
      assetKind: AssetKind.NAT,
      displayInfo: {
        decimalPlaces,
        assetKind: AssetKind.NAT,
      },
    }),
  );

  /**
   * @typedef {{
   *   creatorFacet: ERef<Mint<'nat'>>;
   *   publicFacet: ERef<Issuer<'nat'>>;
   * }} PsmKit
   */

  const { creatorFacet: mint, publicFacet: issuer } =
    /** @type {PsmKit} */
    (
      await E(startUpgradable)({
        installation: mintHolder,
        label: keyword,
        terms,
      })
    );

  const brand = await E(issuer).getBrand();
  const kit = harden({ mint, issuer, brand });

  // @ts-expect-error XXX AssetIssuerKit
  testFirstAnchorKit.resolve(kit);

  const toSlotReviver = makeHistoryReviver(
    chainStorageEntries,
    slotToBoardRemote,
  );
  const metricsKey = `${stablePsmKey}.${keyword}.metrics`;
  const maybeReviveMetrics = async () => {
    if (!toSlotReviver.has(metricsKey)) {
      return;
    }
    const metrics = toSlotReviver.getItem(metricsKey);
    produceAnchorBalancePayments.resolve(
      makeScalarBigMapStore('Anchor balance payments', { durable: true }),
    );
    // XXX this rule should only apply to the 1st await
    const anchorPaymentMap = await anchorBalancePayments;

    // TODO: validate that `metrics.anchorPoolBalance.value` is
    // pass-by-copy PureData (e.g., contains no remotables).
    const pmt = await E(mint).mintPayment(
      AmountMath.make(brand, metrics.anchorPoolBalance.value),
    );
    anchorPaymentMap.init(brand, pmt);
  };
  await maybeReviveMetrics();

  await Promise.all([
    E(E(agoricNamesAdmin).lookupAdmin('issuer')).update(keyword, kit.issuer),
    E(E(agoricNamesAdmin).lookupAdmin('brand')).update(keyword, kit.brand),
    E(bankManager).addAsset(
      denom,
      keyword,
      proposedName,
      // @ts-expect-error XXX AssetIssuerKit
      kit, // with mint
    ),
  ]);
};
harden(makeAnchorAsset);

/** @import {EconomyBootstrapSpace} from './econ-behaviors.js' */

export const INVITE_PSM_COMMITTEE_MANIFEST = harden(
  /** @type {BootstrapManifest} */ ({
    [inviteCommitteeMembers.name]: {
      consume: {
        namesByAddressAdmin: true,
        economicCommitteeCreatorFacet: true,
        econCharterKit: true,
        highPrioritySendersManager: true,
      },
    },
    [inviteToEconCharter.name]: {
      consume: {
        namesByAddressAdmin: true,
        econCharterKit: true,
      },
    },
  }),
);

/** @type {BootstrapManifest} */
export const PSM_MANIFEST = {
  [makeAnchorAsset.name]: {
    vatParameters: { chainStorageEntries: true },
    consume: {
      agoricNamesAdmin: true,
      bankManager: 'bank',
      startUpgradable: true,
      anchorBalancePayments: true,
      anchorKits: true,
    },
    installation: { consume: { mintHolder: 'zoe' } },
    produce: {
      testFirstAnchorKit: true,
      anchorBalancePayments: true,
      anchorKits: true,
    },
  },
  [startPSM.name]: {
    vatParameters: { chainStorageEntries: true },
    consume: {
      agoricNamesAdmin: true,
      board: true,
      chainStorage: true,
      diagnostics: true,
      zoe: 'zoe',
      feeMintAccess: 'zoe',
      economicCommitteeCreatorFacet: 'economicCommittee',
      provisionPoolStartResult: true,
      econCharterKit: 'econCommitteeCharter',
      chainTimerService: 'timer',
      psmKit: true,
      anchorBalancePayments: true,
    },
    produce: { psmKit: 'true' },
    installation: {
      consume: { contractGovernor: 'zoe', psm: 'zoe' },
    },
    instance: {
      consume: { economicCommittee: 'economicCommittee' },
    },
    brand: {
      consume: { [Stable.symbol]: 'zoe' },
    },
  },
};
harden(PSM_MANIFEST);

export const getManifestForPsmGovernance = (
  { restoreRef },
  { installKeys },
) => {
  return {
    manifest: {},
    installations: {
      econCommitteeCharter: restoreRef(installKeys.econCommitteeCharter),
      contractGovernor: restoreRef(installKeys.contractGovernor),
      committee: restoreRef(installKeys.committee),
      binaryVoteCounter: restoreRef(installKeys.binaryVoteCounter),
    },
  };
};

export const getManifestForPsm = (
  { restoreRef },
  { installKeys, anchorOptions },
) => {
  return {
    manifest: PSM_MANIFEST,
    installations: {
      psm: restoreRef(installKeys.psm),
      mintHolder: restoreRef(installKeys.mintHolder),
    },
    options: {
      anchorOptions,
    },
  };
};
