// @ts-check

import { E, Far } from '@endo/far';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { CENTRAL_ISSUER_NAME } from '@agoric/vats/src/core/utils.js';
import '@agoric/governance/exported.js';
import '@agoric/vats/exported.js';
import '@agoric/vats/src/core/types.js';

import { makeGovernedTerms } from './vaultFactory/params.js';

import '../exported.js';

import { makeAmmTerms } from './vpool-xyk-amm/params.js';

import * as Collect from './collect.js';

const { details: X } = assert;
const { entries } = Object;

const SECONDS_PER_HOUR = 60n * 60n;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;

const BASIS_POINTS = 10_000n;

const CENTRAL_DENOM_NAME = 'urun';

/**
 * @param {EconomyBootstrapPowers} powers
 * @param {{ committeeName: string; committeeSize: number }} electorateTerms
 */
export const startEconomicCommittee = async (
  {
    consume: { zoe, governanceBundles },
    produce: { economicCommitteeCreatorFacet },
    installation,
    instance: {
      produce: { economicCommittee },
    },
  },
  electorateTerms = {
    committeeName: 'Initial Economic Committee',
    committeeSize: 1,
  },
) => {
  const bundles = await governanceBundles;

  const installations = await Collect.allValues(
    Collect.mapValues(bundles, bundle => E(zoe).install(bundle)),
  );

  const { creatorFacet, instance } = await E(zoe).startInstance(
    installations.committee,
    {},
    electorateTerms,
  );

  economicCommitteeCreatorFacet.resolve(creatorFacet);
  economicCommittee.resolve(instance);
  entries(installations).forEach(([key, inst]) =>
    installation.produce[key].resolve(inst),
  );
};
harden(startEconomicCommittee);

/** @param {EconomyBootstrapPowers} powers */
export const setupAmm = async ({
  consume: {
    chainTimerService,
    zoe,
    economicCommitteeCreatorFacet: committeeCreator,
    ammBundle,
  },
  produce: { ammCreatorFacet, ammGovernorCreatorFacet },
  issuer: {
    consume: { [CENTRAL_ISSUER_NAME]: centralIssuer },
  },
  instance: {
    consume: { economicCommittee: electorateInstance },
    produce: { amm: ammInstanceProducer, ammGovernor },
  },
  installation: {
    consume: { contractGovernor: governorInstallation },
    produce: { amm: ammInstallationProducer },
  },
}) => {
  const bundle = await ammBundle;
  const ammInstallation = E(zoe).install(bundle);

  const poserInvitationP = E(committeeCreator).getPoserInvitation();
  const [poserInvitation, poserInvitationAmount] = await Promise.all([
    poserInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
  ]);

  const timer = await chainTimerService; // avoid promise for legibility

  const ammTerms = makeAmmTerms(timer, poserInvitationAmount);

  const ammGovernorTerms = {
    timer,
    electorateInstance,
    governedContractInstallation: ammInstallation,
    governed: {
      terms: ammTerms,
      issuerKeywordRecord: { Central: centralIssuer },
      privateArgs: { initialPoserInvitation: poserInvitation },
    },
  };
  const g = await E(zoe).startInstance(
    governorInstallation,
    {},
    ammGovernorTerms,
    {
      electorateCreatorFacet: committeeCreator,
    },
  );

  const [creatorFacet, ammPublicFacet, instance] = await Promise.all([
    E(g.creatorFacet).getCreatorFacet(),
    E(g.creatorFacet).getPublicFacet(),
    E(g.publicFacet).getGovernedContract(),
  ]);
  ammGovernorCreatorFacet.resolve(g.creatorFacet);
  ammCreatorFacet.resolve(creatorFacet);

  // Confirm that the amm was indeed setup
  assert(ammPublicFacet, X`ammPublicFacet broken  ${ammPublicFacet}`);

  ammInstanceProducer.resolve(instance);
  ammGovernor.resolve(g.instance);
  return ammInstallation.then(i => ammInstallationProducer.resolve(i));
};

/**
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<PriceAuthorityVat>> };
 * }} powers
 *
 * @typedef {ERef<
 *   ReturnType<import('../../vats/src/vat-priceAuthority.js').buildRootObject>
 * >} PriceAuthorityVat
 */
export const startPriceAuthority = async ({
  consume: { loadVat },
  produce,
}) => {
  const vats = { priceAuthority: E(loadVat)('priceAuthority') };
  const { priceAuthority, adminFacet } = await E(
    vats.priceAuthority,
  ).makePriceAuthorityRegistry();

  produce.priceAuthorityVat.resolve(vats.priceAuthority);
  produce.priceAuthority.resolve(priceAuthority);
  produce.priceAuthorityAdmin.resolve(adminFacet);
};
harden(startPriceAuthority);

/**
 * @param {EconomyBootstrapPowers} powers
 * @param {Object} config
 * @param {LoanTiming} config.loanParams
 */
export const startVaultFactory = async (
  {
    consume: {
      vaultBundles,
      chainTimerService,
      priceAuthority,
      zoe,
      feeMintAccess: feeMintAccessP, // ISSUE: why doeszn't Zoe await this?
      economicCommitteeCreatorFacet: electorateCreatorFacet,
    },
    produce, // {  vaultFactoryCreator }
    brand: {
      consume: { [CENTRAL_ISSUER_NAME]: centralBrandP },
    },
    instance,
    installation,
  },
  { loanParams } = {
    loanParams: {
      chargingPeriod: SECONDS_PER_HOUR,
      recordingPeriod: SECONDS_PER_DAY,
    },
  },
) => {
  const bundles = await vaultBundles;
  const installations = await Collect.allValues({
    VaultFactory: E(zoe).install(bundles.VaultFactory),
    liquidate: E(zoe).install(bundles.liquidate),
  });

  const poserInvitationP = E(electorateCreatorFacet).getPoserInvitation();
  const [initialPoserInvitation, invitationAmount] = await Promise.all([
    poserInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
  ]);

  const centralBrand = await centralBrandP;

  // declare governed params for the vaultFactory; addVaultType() sets actual rates
  const rates = {
    liquidationMargin: makeRatio(105n, centralBrand),
    interestRate: makeRatio(250n, centralBrand, BASIS_POINTS),
    loanFee: makeRatio(200n, centralBrand, BASIS_POINTS),
  };

  const [ammInstance, electorateInstance, contractGovernorInstall] =
    await Promise.all([
      instance.consume.amm,
      instance.consume.economicCommittee,
      installation.consume.contractGovernor,
    ]);
  const ammPublicFacet = await E(zoe).getPublicFacet(ammInstance);
  const feeMintAccess = await feeMintAccessP;

  const vaultFactoryTerms = makeGovernedTerms(
    priceAuthority,
    loanParams,
    installations.liquidate,
    chainTimerService,
    invitationAmount,
    rates,
    ammPublicFacet,
  );
  const governorTerms = harden({
    timer: chainTimerService,
    electorateInstance,
    governedContractInstallation: installations.VaultFactory,
    governed: {
      terms: vaultFactoryTerms,
      issuerKeywordRecord: {},
      privateArgs: harden({ feeMintAccess, initialPoserInvitation }),
    },
  });

  const { creatorFacet: governorCreatorFacet, instance: governorInstance } =
    await E(zoe).startInstance(
      contractGovernorInstall,
      undefined,
      governorTerms,
      harden({ electorateCreatorFacet }),
    );

  const [vaultFactoryInstance, vaultFactoryCreator] = await Promise.all([
    E(governorCreatorFacet).getInstance(),
    E(governorCreatorFacet).getCreatorFacet(),
  ]);

  const voteCreator = Far('vaultFactory vote creator', {
    voteOnParamChange: E(governorCreatorFacet).voteOnParamChange,
  });

  produce.vaultFactoryCreator.resolve(vaultFactoryCreator);
  produce.vaultFactoryGovernorCreator.resolve(governorCreatorFacet);
  produce.vaultFactoryVoteCreator.resolve(voteCreator);

  // Advertise the installations, instances in agoricNames.
  instance.produce.VaultFactory.resolve(vaultFactoryInstance);
  instance.produce.Treasury.resolve(vaultFactoryInstance);
  instance.produce.VaultFactoryGovernor.resolve(governorInstance);
  entries(installations).forEach(([name, install]) =>
    installation.produce[name].resolve(install),
  );
};

/**
 * Grant access to the VaultFactory creatorFacet to up to one user based on address.
 *
 * @param {BootstrapSpace & {
 *   vatParameters: { argv: { vaultFactoryControllerAddress?: string } };
 * }} powers
 */
export const grantVaultFactoryControl = async ({
  vatParameters: {
    argv: { vaultFactoryControllerAddress },
  },
  consume: { client, priceAuthorityAdmin, vaultFactoryCreator },
}) => {
  E(client).assignBundle([
    addr => ({
      vaultFactoryCreatorFacet:
        typeof vaultFactoryControllerAddress === 'string' &&
        addr === vaultFactoryControllerAddress
          ? vaultFactoryCreator
          : undefined,
      priceAuthorityAdminFacet:
        typeof vaultFactoryControllerAddress === 'string' &&
        addr === vaultFactoryControllerAddress
          ? priceAuthorityAdmin
          : undefined,
    }),
  ]);
};
harden(grantVaultFactoryControl);

/** @param {BootstrapPowers} powers */
export const configureVaultFactoryUI = async ({
  consume: { board, zoe },
  issuer: {
    consume: { [CENTRAL_ISSUER_NAME]: centralIssuerP },
  },
  brand: {
    consume: { [CENTRAL_ISSUER_NAME]: centralBrandP },
  },
  installation: {
    consume: {
      amm: ammInstallation,
      VaultFactory: vaultInstallation,
      contractGovernor,
      noActionElectorate,
      binaryVoteCounter,
      liquidate,
    },
  },
  instance: {
    consume: { amm: ammInstance, VaultFactory: vaultInstance },
  },
  uiConfig,
}) => {
  const installs = await Collect.allValues({
    vaultFactory: vaultInstallation,
    amm: ammInstallation,
    contractGovernor,
    noActionElectorate,
    binaryVoteCounter,
    liquidate,
  });
  const instances = await Collect.allValues({
    amm: ammInstance,
    vaultFactory: vaultInstance,
  });
  const [centralIssuer, centralBrand] = await Promise.all([
    centralIssuerP,
    centralBrandP,
  ]);

  const invitationIssuer = await E(zoe).getInvitationIssuer();

  const vaultFactoryUiDefaults = {
    CONTRACT_NAME: 'VaultFactory',
    AMM_NAME: 'amm',
    BRIDGE_URL: 'http://127.0.0.1:8000',
    // Avoid setting API_URL, so that the UI uses the same origin it came from,
    // if it has an api server.
    // API_URL: 'http://127.0.0.1:8000',
  };

  // Look up all the board IDs.
  const boardIdValue = [
    ['INSTANCE_BOARD_ID', instances.vaultFactory],
    ['INSTALLATION_BOARD_ID', installs.vaultFactory],
    ['RUN_ISSUER_BOARD_ID', centralIssuer],
    ['RUN_BRAND_BOARD_ID', centralBrand],
    ['AMM_INSTALLATION_BOARD_ID', installs.amm],
    ['LIQ_INSTALLATION_BOARD_ID', installs.liquidate],
    ['BINARY_COUNTER_INSTALLATION_BOARD_ID', installs.binaryVoteCounter],
    ['NO_ACTION_INSTALLATION_BOARD_ID', installs.noActionElectorate],
    ['CONTRACT_GOVERNOR_INSTALLATION_BOARD_ID', installs.contractGovernor],
    ['AMM_INSTANCE_BOARD_ID', instances.amm],
    ['INVITE_BRAND_BOARD_ID', E(invitationIssuer).getBrand()],
  ];
  await Promise.all(
    boardIdValue.map(async ([key, valP]) => {
      const val = await valP;
      const boardId = await E(board).getId(val);
      vaultFactoryUiDefaults[key] = boardId;
    }),
  );

  // Stash the defaults where the UI can find them.
  harden(vaultFactoryUiDefaults);

  // Install the names in agoricNames.
  uiConfig.produce[vaultFactoryUiDefaults.CONTRACT_NAME].resolve(
    vaultFactoryUiDefaults,
  );
  uiConfig.produce.Treasury.resolve(vaultFactoryUiDefaults); // compatibility
};
harden(configureVaultFactoryUI);

/**
 * Start the reward distributor.
 *
 * @param {BootstrapPowers & {
 *   consume: { loadVat: ERef<VatLoader<DistributeFeesVat>> };
 * }} powers
 *
 * @typedef {ERef<
 *   ReturnType<import('../../vats/src/vat-distributeFees.js').buildRootObject>
 * >} DistributeFeesVat
 */
export const startRewardDistributor = async ({
  consume: {
    chainTimerService,
    bankManager,
    loadVat,
    vaultFactoryCreator,
    ammCreatorFacet,
    zoe,
  },
  issuer: {
    consume: { RUN: centralIssuerP },
  },
  brand: {
    consume: { RUN: centralBrandP },
  },
}) => {
  const epochTimerService = await chainTimerService;
  const distributorParams = {
    epochInterval: 60n * 60n, // 1 hour
  };
  const [centralIssuer, centralBrand] = await Promise.all([
    centralIssuerP,
    centralBrandP,
  ]);
  const feeCollectorDepositFacet = await E(bankManager)
    .getFeeCollectorDepositFacet(CENTRAL_DENOM_NAME, {
      issuer: centralIssuer,
      brand: centralBrand,
    })
    .catch(e => {
      console.log('Cannot create fee collector deposit facet', e);
      return undefined;
    });

  // Only distribute fees if there is a collector.
  if (!feeCollectorDepositFacet) {
    return;
  }

  const vats = { distributeFees: E(loadVat)('distributeFees') };
  const [vaultAdmin, ammAdmin] = await Promise.all([
    vaultFactoryCreator,
    ammCreatorFacet,
  ]);
  await E(vats.distributeFees).buildDistributor(
    [vaultAdmin, ammAdmin].map(cf =>
      E(vats.distributeFees).makeFeeCollector(zoe, cf),
    ),
    feeCollectorDepositFacet,
    epochTimerService,
    harden(distributorParams),
  );
};
harden(startRewardDistributor);
