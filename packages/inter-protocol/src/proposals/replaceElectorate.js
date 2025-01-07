/**
 * @file A proposal to replace the EC committee and charter.
 *
 *   This script manages configuration updates, distributes invitations, and
 *   establishes committees using specified voter addresses and related
 *   parameters.
 *
 *   See `@agoric/builders/scripts/inter-protocol/replace-electorate-core.js` for
 *   the proposal builder.
 */

// @ts-check
import { E } from '@endo/eventual-send';
import {
  assertPathSegment,
  makeStorageNodeChild,
} from '@agoric/internal/src/lib-chainStorage.js';
import { provideRetiredInstances, reserveThenDeposit } from './utils.js';

/** @import {EconomyBootstrapPowers} from './econ-behaviors.js' */
/** @import {EconCharterStartResult} from './econ-behaviors.js' */
/** @import {CommitteeElectorateCreatorFacet} from '@agoric/governance/src/committee.js'; */

const trace = (...args) => console.log('GovReplaceCommiteeAndCharter', ...args);

const traced = (label, x) => {
  trace(label, x);
  return x;
};

const { values } = Object;

/** @type {<X, Y>(xs: X[], ys: Y[]) => [X, Y][]} */
const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]]);

/** @type {(name: string) => string} */
const sanitizePathSegment = name => {
  const candidate = name.replace(/[ ,]/g, '_');
  assertPathSegment(candidate);
  return candidate;
};

/**
 * Handles the configuration updates for high-priority senders list by adding or
 * removing addresses.
 *
 * @param {EconomyBootstrapPowers} powers - The bootstrap powers required for
 *   economic operations.
 * @param {{
 *   options: {
 *     highPrioritySendersConfig: {
 *       addressesToAdd: string[];
 *       addressesToRemove: string[];
 *     };
 *   };
 * }} config
 *   - The configuration object containing lists of addresses to add or remove.
 */
const handlehighPrioritySendersList = async (
  { consume: { highPrioritySendersManager: highPrioritySendersManagerP } },
  { options: { highPrioritySendersConfig } },
) => {
  const HIGH_PRIORITY_SENDERS_NAMESPACE = 'economicCommittee';
  const highPrioritySendersManager = await highPrioritySendersManagerP;

  if (!highPrioritySendersManager) {
    throw assert.error(`highPrioritySendersManager is not defined`);
  }

  const { addressesToAdd, addressesToRemove } = highPrioritySendersConfig;

  await Promise.all(
    addressesToAdd.map(async addr =>
      E(highPrioritySendersManager).add(
        HIGH_PRIORITY_SENDERS_NAMESPACE,
        traced('High Priority Senders: adding', addr),
      ),
    ),
  );

  await Promise.all(
    addressesToRemove.map(async addr =>
      E(highPrioritySendersManager).remove(
        HIGH_PRIORITY_SENDERS_NAMESPACE,
        traced('High Priority Senders: removing', addr),
      ),
    ),
  );
};

/**
 * Invites Economic Committee (EC) members by distributing voting invitations to
 * the specified addresses.
 *
 * @param {EconomyBootstrapPowers} powers - The bootstrap powers required for
 *   economic operations, including `namesByAddressAdmin` used for managing
 *   names.
 * @param {{
 *   options: {
 *     voterAddresses: Record<string, string>;
 *     economicCommitteeCreatorFacet: CommitteeElectorateCreatorFacet;
 *   };
 * }} config
 *   - The configuration object containing voter addresses and the economic
 *       committee facet to create voter invitations.
 *
 * @returns {Promise<void>} A promise that resolves once the invitations have
 *   been distributed.
 */
const inviteECMembers = async (
  { consume: { namesByAddressAdmin } },
  { options: { voterAddresses = {}, economicCommitteeCreatorFacet } },
) => {
  trace('Create invitations for new committee');

  const invitations = await E(
    economicCommitteeCreatorFacet,
  ).getVoterInvitations();
  assert.equal(invitations.length, values(voterAddresses).length);

  trace('Distribute invitations');
  /** @param {[string, Promise<Invitation>][]} addrInvitations */
  const distributeInvitations = async addrInvitations => {
    await Promise.all(
      addrInvitations.map(async ([addr, invitationP]) => {
        const [voterInvitation] = await Promise.all([invitationP]);
        trace('Sending voting invitations to', addr);
        await reserveThenDeposit(
          `econ committee member ${addr}`,
          namesByAddressAdmin,
          addr,
          [voterInvitation],
        );
      }),
    );
  };

  await distributeInvitations(zip(values(voterAddresses), invitations));
};

/**
 * Invites members to the Economic Charter by creating and distributing charter
 * member invitations to the specified voter addresses.
 *
 * @param {EconomyBootstrapPowers} powers - The bootstrap powers required for
 *   economic operations, including `namesByAddressAdmin` used for managing
 *   names and deposits.
 * @param {{
 *   options: {
 *     voterAddresses: Record<string, string>;
 *     econCharterKit: {
 *       creatorFacet: {
 *         makeCharterMemberInvitation: () => Promise<Invitation>;
 *       };
 *     };
 *   };
 * }} opts
 *   - The configuration object containing voter addresses and the econ charter kit
 *       for creating charter member invitations.
 *
 * @returns {Promise<void>} This function does not explicitly return a value. It
 *   processes all charter member invitations asynchronously.
 */
const inviteToEconCharter = async (
  { consume: { namesByAddressAdmin } },
  { options: { voterAddresses, econCharterKit } },
) => {
  const { creatorFacet } = E.get(econCharterKit);

  void Promise.all(
    values(voterAddresses).map(async addr => {
      const debugName = `econ charter member ${addr}`;
      reserveThenDeposit(debugName, namesByAddressAdmin, addr, [
        E(creatorFacet).makeCharterMemberInvitation(),
      ]).catch(err => console.error(`failed deposit to ${debugName}`, err));
    }),
  );
};

/**
 * Starts a new Economic Committee (EC) by creating an instance with the
 * provided committee specifications.
 *
 * @param {EconomyBootstrapPowers &
 *   PromiseSpaceOf<{ retiredContractInstances: MapStore<string, Instance> }>} powers
 *   - The resources and capabilities required to start the committee.
 *
 * @param {{
 *   options: {
 *     committeeName: string;
 *     committeeSize: number;
 *   };
 * }} config
 *   - Configuration object containing the name and size of the committee.
 *
 * @returns {Promise<CommitteeElectorateCreatorFacet>} A promise that resolves
 *   to the creator facet of the newly created EC instance.
 */
const startNewEconomicCommittee = async (
  {
    consume: {
      board,
      chainStorage,
      startUpgradable,
      retiredContractInstances: retiredInstancesP,
    },
    produce: {
      economicCommitteeKit,
      economicCommitteeCreatorFacet,
      retiredContractInstances: produceRetiredInstances,
    },
    installation: {
      consume: { committee },
    },
    instance: {
      consume: { economicCommittee: economicCommitteeOriginalP },
      produce: { economicCommittee },
    },
  },
  { options: { committeeName, committeeSize } },
) => {
  const COMMITTEES_ROOT = 'committees';

  trace('startNewEconomicCommittee');

  trace(`committeeName ${committeeName}`);
  trace(`committeeSize ${committeeSize}`);

  const retiredInstances = await provideRetiredInstances(
    retiredInstancesP,
    produceRetiredInstances,
  );

  // Record the retired electorate instance so we can manage it later.
  const economicCommitteeOriginal = await economicCommitteeOriginalP;
  const boardID = await E(board).getId(economicCommitteeOriginal);
  retiredInstances.init(
    `economicCommittee-${boardID}`,
    economicCommitteeOriginal,
  );

  const committeesNode = await makeStorageNodeChild(
    chainStorage,
    COMMITTEES_ROOT,
  );
  const storageNode = await E(committeesNode).makeChildNode(
    sanitizePathSegment(committeeName),
  );

  const marshaller = await E(board).getPublishingMarshaller();

  trace('Starting new EC Committee Instance');

  const privateArgs = {
    storageNode,
    marshaller,
  };

  const terms = {
    committeeName,
    committeeSize,
  };

  const startResult = await E(startUpgradable)({
    label: 'economicCommittee',
    installation: committee,
    privateArgs,
    terms,
  });

  const { instance, creatorFacet } = startResult;

  trace('Started new EC Committee Instance Successfully');
  economicCommitteeKit.reset();
  economicCommitteeKit.resolve(
    harden({ ...startResult, label: 'economicCommittee' }),
  );

  economicCommittee.reset();
  economicCommittee.resolve(instance);

  economicCommitteeCreatorFacet.reset();
  economicCommitteeCreatorFacet.resolve(creatorFacet);

  return creatorFacet;
};

/**
 * Starts a new Economic Committee Charter by creating an instance with the
 * provided committee specifications.
 *
 * @param {EconomyBootstrapPowers &
 *   PromiseSpaceOf<{ retiredContractInstances: MapStore<string, Instance> }>} powers
 *   - The resources and capabilities required to start the committee.
 *
 * @returns {Promise<EconCharterStartResult>} A promise that resolves to the
 *   charter kit result.
 */
const startNewEconCharter = async ({
  consume: {
    board,
    startUpgradable,
    contractKits: contractKitsP,
    econCharterKit: econCharterKitP,
    retiredContractInstances: retiredContractInstancesP,
  },
  produce: {
    econCharterKit: produceEconCharterKit,
    retiredContractInstances: produceRetiredInstances,
  },
  installation: {
    consume: { binaryVoteCounter: counterP, econCommitteeCharter: installP },
  },
  instance: {
    produce: { econCommitteeCharter },
    consume: { econCommitteeCharter: previousInstanceP },
  },
}) => {
  const [
    charterInstall,
    counterInstall,
    previousInstance,
    contractKits,
    econCharterKit,
    retiredInstances,
  ] = await Promise.all([
    installP,
    counterP,
    previousInstanceP,
    contractKitsP,
    econCharterKitP,
    provideRetiredInstances(retiredContractInstancesP, produceRetiredInstances),
  ]);

  const label = 'econCommitteeCharter';
  const previousCharterKit = { ...econCharterKit, label };

  const boardID = await E(board).getId(previousCharterKit.instance);
  const identifier = `${label}-${boardID}`;
  trace('Saving previous EC Charter Instance', label);

  // save the old charter instance kit so we can manage it later
  if (retiredInstances.has(identifier)) {
    // bootstrap tests start having already run this upgrade. Actual upgrades on
    // mainNet or testnets should start with the promiseSpace post upgrade-17,
    // which doesn't have this entry in the map.
    trace(
      '⚠️ WARNING: collision on storing Charter in retireInstances not' +
        ' expected during chain upgrade.   It IS normal during bootstrap tests',
    );
  } else {
    retiredInstances.init(identifier, previousCharterKit.instance);
  }
  if (contractKits.has(previousInstance)) {
    // bootstrap tests start having already run this upgrade. Actual upgrades on
    // mainNet or testnets should start with the promiseSpace post upgrade-17,
    // which doesn't have this entry in the map.
    trace(
      '⚠️ WARNING: collision on storing Charter in contractKits not' +
        ' expected during chain upgrade.   It IS normal during bootstrap tests',
    );
  } else {
    contractKits.init(previousInstance, previousCharterKit);
  }

  trace('Starting new EC Charter Instance');

  const terms = harden({
    binaryVoteCounterInstallation: counterInstall,
  });
  const startResult = await E(startUpgradable)({
    label,
    installation: charterInstall,
    terms,
  });

  trace('Started new EC Charter Instance Successfully');

  econCommitteeCharter.reset();
  econCommitteeCharter.resolve(E.get(startResult).instance);

  produceEconCharterKit.reset();
  produceEconCharterKit.resolve(startResult);
  return startResult;
};

/**
 * @typedef {PromiseSpaceOf<{
 *   auctionUpgradeNewInstance: Instance;
 *   auctionUpgradeNewGovCreator: any;
 *   retiredContractInstances: MapStore<string, Instance>;
 * }>} interlockPowers
 */

/**
 * Adds governors to an existing Economic Committee Charter
 *
 * @param {EconomyBootstrapPowers & interlockPowers} powers
 *
 *   - The resources and capabilities required to start the committee.
 *
 * @param {{
 *   options: {
 *     econCharterKit: EconCharterStartResult;
 *   };
 * }} options
 *   - Configuration object containing the name and size of the committee.
 *
 * @returns {Promise<void>} A promise that resolves once all the governors have
 *   been successfully added to the economic charter
 */
const addGovernorsToEconCharter = async (
  {
    consume: {
      auctionUpgradeNewInstance: auctionUpgradeNewInstanceP,
      auctionUpgradeNewGovCreator: auctionUpgradeNewGovCreatorP,
      psmKit,
      governedContractKits,
    },
    produce: {
      auctionUpgradeNewGovCreator: auctionUpgradeNewGovCreatorProduce,
    },
  },
  { options: { econCharterKit } },
) => {
  const { creatorFacet: ecCreatorFacet } = E.get(econCharterKit);

  const psmKitMap = await psmKit;

  for (const { psm, psmGovernorCreatorFacet, label } of psmKitMap.values()) {
    await E(ecCreatorFacet).addInstance(psm, psmGovernorCreatorFacet, label);
  }

  const governedContractKitMap = await governedContractKits;
  for (const {
    instance,
    governorCreatorFacet,
    label,
  } of governedContractKitMap.values()) {
    // The auctioneer was updated in this same release, getting values directly
    // (there might be more than one auctioneer instance, but the others don't
    // need to be registered.)
    if (label !== 'auctioneer') {
      await E(ecCreatorFacet).addInstance(
        instance,
        governorCreatorFacet,
        label,
      );
    }
  }

  const [auctionUpgradeNewInstance, auctionUpgradeNewGovCreator] =
    await Promise.all([
      auctionUpgradeNewInstanceP,
      auctionUpgradeNewGovCreatorP,
    ]);
  // reset after use. auctionUpgradeNewInstance is reset by upgrade-vault.js
  auctionUpgradeNewGovCreatorProduce.reset();

  await E(ecCreatorFacet).addInstance(
    auctionUpgradeNewInstance,
    auctionUpgradeNewGovCreator,
    'auctioneer',
  );
};

/**
 * Replaces the electorate for governance contracts by creating a new Economic
 * Committee and updating contracts with the new electorate's creator facet.
 *
 * @param {EconomyBootstrapPowers & interlockPowers} permittedPowers - The
 *   resources and capabilities needed for operations, including access to
 *   governance contracts and the PSM kit.
 * @param {{
 *   options: {
 *     committeeName: string;
 *     voterAddresses: Record<string, string>;
 *     highPrioritySendersConfig: {
 *       addressesToAdd: string[];
 *       addressesToRemove: string[];
 *     };
 *   };
 * }} config
 *   - Configuration object containing the committee details and governance options.
 *
 * @returns {Promise<void>} A promise that resolves when the electorate has been
 *   replaced.
 */
export const replaceAllElectorates = async (permittedPowers, config) => {
  const { committeeName, voterAddresses, highPrioritySendersConfig } =
    config.options;

  const economicCommitteeCreatorFacet = await startNewEconomicCommittee(
    permittedPowers,
    {
      options: {
        committeeName,
        committeeSize: values(voterAddresses).length,
      },
    },
  );

  const governedContractKitsMap =
    await permittedPowers.consume.governedContractKits;
  const psmKitMap = await permittedPowers.consume.psmKit;

  const governanceDetails = [
    ...[...governedContractKitsMap.values()].map(governedContractKit => ({
      creatorFacet: governedContractKit.governorCreatorFacet,
      label: governedContractKit.label,
    })),
    ...[...psmKitMap.values()].map(psmKit => ({
      creatorFacet: psmKit.psmGovernorCreatorFacet,
      label: psmKit.label,
    })),
  ];

  await Promise.all(
    governanceDetails.map(async ({ creatorFacet, label }) => {
      trace(`Getting PoserInvitation for ${label}...`);
      const newElectoratePoser = await E(
        economicCommitteeCreatorFacet,
      ).getPoserInvitation();
      trace(`Successfully received newElectoratePoser for ${label}`);

      trace(`Replacing electorate for ${label}`);
      await E(creatorFacet).replaceElectorate(newElectoratePoser);
      trace(`Successfully replaced electorate for ${label}`);
    }),
  );

  await inviteECMembers(permittedPowers, {
    options: {
      voterAddresses,
      economicCommitteeCreatorFacet,
    },
  });

  await handlehighPrioritySendersList(permittedPowers, {
    options: {
      highPrioritySendersConfig,
    },
  });

  trace('Installed New Economic Committee');

  const econCharterKit = await startNewEconCharter(permittedPowers);
  await addGovernorsToEconCharter(permittedPowers, {
    options: { econCharterKit },
  });

  await inviteToEconCharter(permittedPowers, {
    options: { voterAddresses, econCharterKit },
  });

  trace('Installed New EC Charter');
};

harden(replaceAllElectorates);

export const getManifestForReplaceAllElectorates = async (
  { economicCommitteeRef: _economicCommitteeRef },
  options,
) => ({
  manifest: {
    [replaceAllElectorates.name]: {
      consume: {
        agoricNames: true,
        auctionUpgradeNewGovCreator: true,
        auctionUpgradeNewInstance: true,
        psmKit: true,
        contractKits: true,
        econCharterKit: true,
        governedContractKits: true,
        chainStorage: true,
        highPrioritySendersManager: true,
        namesByAddressAdmin: true,
        retiredContractInstances: true,
        // Rest of these are designed to be widely shared
        board: true,
        startUpgradable: true,
      },
      produce: {
        econCharterKit: true,
        economicCommitteeKit: true,
        economicCommitteeCreatorFacet: true,
        auctionUpgradeNewGovCreator: true,
        retiredContractInstances: true,
      },
      installation: {
        consume: {
          committee: true,
          binaryVoteCounter: true,
          econCommitteeCharter: true,
        },
      },
      instance: {
        produce: {
          economicCommittee: true,
          econCommitteeCharter: true,
        },
        consume: {
          economicCommittee: true,
          econCommitteeCharter: true,
        },
      },
    },
  },
  options: { ...options },
});
