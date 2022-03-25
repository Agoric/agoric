// @ts-check

import { E } from '@endo/eventual-send';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport/index.js';
import { Far } from '@endo/marshal';

import buildManualTimer from '@agoric/zoe/tools/manualTimer';
import { makeGovernedTerms } from '../../src/vaultFactory/params';
import { ammMock } from './mockAmm';

const ONE_DAY = 24n * 60n * 60n;
const SECONDS_PER_HOUR = 60n * 60n;
const SECONDS_PER_DAY = 24n * SECONDS_PER_HOUR;
const BASIS_POINTS = 10000n;

const setupBasicMints = () => {
  const all = [makeIssuerKit('moola')];
  const mints = all.map(objs => objs.mint);
  const issuers = all.map(objs => objs.issuer);
  const brands = all.map(objs => objs.brand);

  return harden({
    mints,
    issuers,
    brands,
  });
};

const installContracts = async (zoe, cb) => {
  const [liquidateMinimum, vaultFactory, electorate, counter, governor] =
    await Promise.all([
      E(zoe).install(cb.liquidateMinimum),
      E(zoe).install(cb.vaultFactory),
      E(zoe).install(cb.committee),
      E(zoe).install(cb.binaryVoteCounter),
      E(zoe).install(cb.contractGovernor),
    ]);

  const installations = {
    liquidateMinimum,
    vaultFactory,
    electorate,
    counter,
    governor,
  };
  return installations;
};

const makeRates = runBrand => {
  return {
    liquidationMargin: makeRatio(105n, runBrand),
    interestRate: makeRatio(250n, runBrand, BASIS_POINTS),
    loanFee: makeRatio(200n, runBrand, BASIS_POINTS),
  };
};

const startElectorate = async (zoe, installations) => {
  const electorateTerms = harden({
    committeeName: 'TwentyCommittee',
    committeeSize: 5,
  });
  const { creatorFacet: electorateCreatorFacet, instance: electorateInstance } =
    await E(zoe).startInstance(
      installations.electorate,
      harden({}),
      electorateTerms,
    );
  return { electorateCreatorFacet, electorateInstance };
};

/**
 * @param {CommitteeElectorateCreatorFacet} electorateCreatorFacet
 * @param {any} voterCreator
 * @returns {Promise<unknown[]>}
 */
const createCommittee = async (electorateCreatorFacet, voterCreator) => {
  const invitations = await E(electorateCreatorFacet).getVoterInvitations();

  const floraP = E(voterCreator).createVoter('Flora', invitations[0]);
  const bobP = E(voterCreator).createVoter('Bob', invitations[1]);
  const carolP = E(voterCreator).createVoter('Carol', invitations[2]);
  const daveP = E(voterCreator).createVoter('Dave', invitations[3]);
  const emmaP = E(voterCreator).createVoter('Emma', invitations[4]);
  return Promise.all([bobP, carolP, daveP, emmaP, floraP]);
};

const makeVats = async (
  log,
  vats,
  zoe,
  installations,
  startingValues,
  feeMintAccess,
) => {
  const timer = buildManualTimer(console.log, 0n, ONE_DAY);
  const { mints, issuers, brands } = setupBasicMints();
  const makePayments = values =>
    mints.map((mint, i) =>
      mint.mintPayment(AmountMath.make(brands[i], BigInt(values[i]))),
    );
  const [aliceValues, ownerValues] = startingValues;

  // Setup Alice
  const aliceP = E(vats.alice).build(
    zoe,
    brands,
    makePayments(aliceValues),
    timer,
  );

  const { electorateCreatorFacet, electorateInstance } = await startElectorate(
    zoe,
    installations,
  );

  // Setup Owner
  const {
    governor,
    governed: vaultFactory,
    runBrand,
  } = await E(vats.owner).build(
    zoe,
    issuers,
    brands,
    makePayments(ownerValues),
    installations,
    timer,
    vats.priceAuthority,
    feeMintAccess,
    electorateInstance,
    electorateCreatorFacet,
  );

  log(`=> alice and the vaultFactory are set up`);
  return {
    aliceP,
    governor,
    vaultFactory,
    runBrand,
    timer,
    electorateCreatorFacet,
    electorateInstance,
    brands,
  };
};

/**
 * @param {(msg: any) => void} log
 * @param {ZoeService} zoe
 * @param {unknown[]} issuers
 * @param {Brand[]} brands
 * @param {Payment[]} payments
 * @param {any} installations
 * @param {ManualTimer} timer
 * @param {any} priceAuthorityVat
 * @param {any} feeMintAccess
 * @param {any} electorateInstance
 * @param {any} electorateCreatorFacet
 */
const buildOwner = async (
  log,
  zoe,
  issuers,
  brands,
  payments,
  installations,
  timer,
  priceAuthorityVat,
  feeMintAccess,
  electorateInstance,
  electorateCreatorFacet,
) => {
  const [moolaBrand] = brands;
  const [moolaIssuer] = issuers;
  const runBrand = await E(E(zoe).getFeeIssuer()).getBrand();

  const rates = makeRates(runBrand);

  const loanTiming = {
    chargingPeriod: SECONDS_PER_DAY,
    recordingPeriod: SECONDS_PER_DAY,
  };

  const priceAuthorityKit = await E(priceAuthorityVat).makePriceAuthority();

  const poserInvitationP = E(electorateCreatorFacet).getPoserInvitation();
  const [initialPoserInvitation, poserInvitationAmount] = await Promise.all([
    poserInvitationP,
    E(E(zoe).getInvitationIssuer()).getAmountOf(poserInvitationP),
  ]);

  const terms = makeGovernedTerms(
    priceAuthorityKit.priceAuthority,
    loanTiming,
    installations.liquidateMinimum,
    timer,
    poserInvitationAmount,
    rates,
    // @ts-ignore It's not a real AMM public facet
    ammMock,
  );

  const privateVaultFactoryArgs = { feeMintAccess, initialPoserInvitation };

  const governorFacets = await E(zoe).startInstance(
    installations.governor,
    harden({}),
    harden({
      timer,
      electorateInstance,
      governedContractInstallation: installations.vaultFactory,
      governed: {
        terms,
        issuerKeywordRecord: {},
        privateArgs: privateVaultFactoryArgs,
      },
    }),
  );

  const governedInstance = await E(governorFacets.creatorFacet).getInstance();
  const governedPublicFacet = E(zoe).getPublicFacet(governedInstance);

  const {
    issuers: { RUN: runIssuer },
  } = await E(zoe).getTerms(governedInstance);

  await E(E(governorFacets.creatorFacet).getCreatorFacet()).addVaultType(
    moolaIssuer,
    'Moola',
    rates,
  );

  const QUOTE_INTERVAL = 24n * 60n * 60n;
  const moolaPriceAuthority = await E(priceAuthorityVat).makeFakePriceAuthority(
    harden({
      issuerIn: moolaIssuer,
      issuerOut: runIssuer,
      actualBrandIn: moolaBrand,
      actualBrandOut: runBrand,
      priceList: [100000n, 120000n, 110000n, 80000n],
      timer,
      quoteInterval: QUOTE_INTERVAL,
    }),
  );

  await E(priceAuthorityKit.adminFacet).registerPriceAuthority(
    moolaPriceAuthority,
    moolaBrand,
    runBrand,
  );

  const voteCreator = Far('vaultFactory vote creator', {
    voteOnParamChange: E(governorFacets.creatorFacet).voteOnParamChange,
  });

  const governed = {
    instance: governedInstance,
    creatorFacet: E(governorFacets.creatorFacet).getCreatorFacet(),
    publicFacet: governedPublicFacet,
    voteCreator,
  };

  return { governor: governorFacets, governed, runBrand };
};

harden(buildOwner);
harden(makeRates);
harden(setupBasicMints);
harden(ONE_DAY);
harden(createCommittee);
harden(startElectorate);
harden(installContracts);
harden(makeVats);

export {
  buildOwner,
  makeRates,
  setupBasicMints,
  ONE_DAY,
  createCommittee,
  startElectorate,
  installContracts,
  makeVats,
};
