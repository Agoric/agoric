import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import {
  makeAgoricNamesRemotesFromFakeStorage,
  slotToBoardRemote,
  unmarshalFromVstorage,
} from '@agoric/vats/tools/board-utils.js';
import { makeMarshal, passStyleOf } from '@endo/marshal';
import { NonNullish } from '@agoric/internal';

import { makeSwingsetTestKit } from '../../tools/supports.js';
import {
  makeGovernanceDriver,
  makeWalletFactoryDriver,
} from '../../tools/drivers.js';
import { makeLiquidationTestKit } from '../../tools/liquidation.js';

const wallets = [
  'agoric1gx9uu7y6c90rqruhesae2t7c2vlw4uyyxlqxrx',
  'agoric1d4228cvelf8tj65f4h7n2td90sscavln2283h5',
  'agoric14543m33dr28x7qhwc558hzlj9szwhzwzpcmw6a',
  'agoric13p9adwk0na5npfq64g22l6xucvqdmu3xqe70wq',
  'agoric1el6zqs8ggctj5vwyukyk4fh50wcpdpwgugd5l5',
  'agoric1zayxg4e9vd0es9c9jlpt36qtth255txjp6a8yc',
];

const managerGovernanceKey =
  'published.vaultFactory.managers.manager0.governance';
const auctioneerParamsKey = 'published.auction.governance';
const provisionPoolParamsKey = 'published.provisionPool.governance';
const reserveParamsKey = 'published.reserve.metrics';
const getPsmKey = brand => `published.psm.IST.${brand}.governance`;

const highPrioritySenderKey = 'highPrioritySenders';

const offerIds = {
  propose: { outgoing: 'charterMembership', incoming: 'incoming_propose' },
  vote: { outgoing: 'committeeMembership', incoming: 'incoming_vote' },
};

const getQuestionId = id => `propose-question-${id}`;
const getVoteId = id => `vote-${id}`;

export const makeZoeTestContext = async t => {
  console.time('ZoeTestContext');
  const swingsetTestKit = await makeSwingsetTestKit(t.log, undefined, {
    configSpecifier: '@agoric/vm-config/decentral-main-vaults-config.json',
  });

  const { runUtils, storage } = swingsetTestKit;
  console.timeLog('DefaultTestContext', 'swingsetTestKit');
  const { EV } = runUtils;

  await eventLoopIteration();

  // We don't need vaults, but this gets the brand, which is checked somewhere
  // Wait for ATOM to make it into agoricNames
  await EV.vat('bootstrap').consumeItem('vaultFactoryKit');
  console.timeLog('DefaultTestContext', 'vaultFactoryKit');

  // replaceElectorate relies on these values from the auction upgrade.  Insert
  // them manually since this bootstrap test doesn't run the auction upgrade.
  const governedKits = await EV.vat('bootstrap').consumeItem(
    'governedContractKits',
  );
  const auctioneerKit = await EV.vat('bootstrap').consumeItem('auctioneerKit');
  const auctionInstance = await auctioneerKit.instance;
  const aKit = await EV(governedKits).get(auctionInstance);
  await EV.vat('bootstrap').produceItem(
    'auctionUpgradeNewInstance',
    aKit.instance,
  );
  await EV.vat('bootstrap').produceItem(
    'auctionUpgradeNewGovCreator',
    aKit.governorCreatorFacet,
  );

  // has to be late enough for agoricNames data to have been published
  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  console.timeLog('DefaultTestContext', 'agoricNamesRemotes');

  console.timeEnd('DefaultTestContext');
  const walletFactoryDriver = await makeWalletFactoryDriver(
    runUtils,
    storage,
    agoricNamesRemotes,
  );

  const { fromCapData } = makeMarshal(undefined, slotToBoardRemote);

  const getVstorageData = key => {
    const data = unmarshalFromVstorage(storage.data, key, fromCapData, -1);
    return data;
  };

  const governanceDriver = await makeGovernanceDriver(
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    wallets,
  );

  const liquidationTestKit = await makeLiquidationTestKit({
    swingsetTestKit,
    agoricNamesRemotes,
    walletFactoryDriver,
    governanceDriver,
    t,
  });

  return {
    ...swingsetTestKit,
    ...liquidationTestKit,
    storage,
    getVstorageData,
    governanceDriver,
  };
};
const test = anyTest as TestFn<Awaited<ReturnType<typeof makeZoeTestContext>>>;

test.before(async t => {
  t.context = await makeZoeTestContext(t);
});

test.serial('normal running of committee', async t => {
  const { advanceTimeBy, storage, getVstorageData, governanceDriver } =
    t.context;

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { VaultFactory } = agoricNamesRemotes.instance;
  const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

  const committee = governanceDriver.ecMembers;

  t.log('Accepting all invitations for original committee');
  await null;
  for (const member of committee) {
    await member.acceptOutstandingCharterInvitation(offerIds.propose.outgoing);
    await member.acceptOutstandingCommitteeInvitation(offerIds.vote.outgoing);
  }

  t.log('Proposing a question using first wallet');
  await governanceDriver.proposeParams(
    VaultFactory,
    { DebtLimit: { brand: debtBrand, value: 100_000_000n } },
    { paramPath: { key: { collateralBrand } } },
    committee[0],
    getQuestionId(1),
    offerIds.propose.outgoing,
  );

  t.log('Checking if question proposal passed');
  t.like(committee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(1), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 3 wallets');
  await governanceDriver.enactLatestProposal(
    committee,
    getVoteId(1),
    offerIds.vote.outgoing,
  );

  t.log('Checking if votes passed');
  for (const w of committee.slice(0, 3)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(1), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');

  const lastOutcome = await governanceDriver.getLatestOutcome();
  console.log(lastOutcome);
  const managerParams = getVstorageData(managerGovernanceKey);
  t.deepEqual(managerParams.current.DebtLimit.value.value, 100_000_000n);
  t.assert(lastOutcome.outcome === 'win');
});

test.serial(
  'check high priority senders before replacing committee',
  async t => {
    const { storage } = t.context;

    const data: any = storage.toStorage({
      method: 'children',
      args: [highPrioritySenderKey],
    });
    t.deepEqual(data.sort(), [...wallets].sort());
  },
);

test.serial('Update reserve metrics', async t => {
  // Need to update metrics before membership upgrade for tests related to vault params later
  const { advanceTimeTo, setupVaults, priceFeedDrivers, readPublished } =
    t.context;
  const setup = {
    vaults: [
      {
        atom: 15,
        ist: 100,
        debt: 100.5,
      },
    ],
    bids: [],
    price: {
      starting: 12.34,
      trigger: 9.99,
    },
    auction: {
      start: {
        collateral: 45,
        debt: 309.54,
      },
      end: {
        collateral: 31.414987,
        debt: 209.54,
      },
    },
  };

  await setupVaults('ATOM', 0, setup);
  await priceFeedDrivers.ATOM.setPrice(setup.price.trigger);
  const liveSchedule = readPublished('auction.schedule');
  await advanceTimeTo(NonNullish(liveSchedule.nextDescendingStepTime));
  t.pass();
});

test.serial('replace committee', async t => {
  const { buildProposal, evalProposal, storage } = t.context;

  const preEvalAgoricNames = makeAgoricNamesRemotesFromFakeStorage(storage);
  await evalProposal(
    buildProposal(
      '@agoric/builders/scripts/inter-protocol/replace-electorate-core.js',
      ['BOOTSTRAP_TEST'],
    ),
  );
  await eventLoopIteration();

  const postEvalAgoricNames = makeAgoricNamesRemotesFromFakeStorage(storage);

  t.not(
    preEvalAgoricNames.instance.economicCommittee,
    postEvalAgoricNames.instance.economicCommittee,
  );
});

test.serial(
  'check high priority senders after replacing committee',
  async t => {
    const { storage } = t.context;

    const data: any = storage.toStorage({
      method: 'children',
      args: [highPrioritySenderKey],
    });
    t.deepEqual(data.sort(), wallets.slice(0, 3).sort());
  },
);

test.serial('successful proposal and vote by 2 continuing members', async t => {
  const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { economicCommittee, econCommitteeCharter, VaultFactory } =
    agoricNamesRemotes.instance;
  const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

  t.log('Accepting all new invitations for voters');
  await null;
  for (const member of newCommittee) {
    await member.acceptOutstandingCharterInvitation(
      offerIds.propose.incoming,
      econCommitteeCharter,
    );
    await member.acceptOutstandingCommitteeInvitation(
      offerIds.vote.incoming,
      economicCommittee,
    );
  }

  t.log('Proposing question using old charter invitation');
  await governanceDriver.proposeParams(
    VaultFactory,
    { DebtLimit: { brand: debtBrand, value: 200_000_000n } },
    { paramPath: { key: { collateralBrand } } },
    newCommittee[0],
    getQuestionId(2),
    offerIds.propose.incoming,
  );

  t.like(newCommittee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(2), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  await governanceDriver.enactLatestProposal(
    newCommittee.slice(0, 2),
    getVoteId(2),
    offerIds.vote.incoming,
  );
  for (const w of newCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(2), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');
  const lastOutcome = await governanceDriver.getLatestOutcome();
  const managerParams = getVstorageData(managerGovernanceKey);
  t.deepEqual(managerParams.current.DebtLimit.value.value, 200_000_000n);
  t.assert(lastOutcome.outcome === 'win');
});

test.serial('unsuccessful vote by 2 outgoing members', async t => {
  const { governanceDriver, storage, advanceTimeBy, getVstorageData } =
    t.context;
  const outgoingCommittee = governanceDriver.ecMembers.slice(3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { VaultFactory } = agoricNamesRemotes.instance;
  const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

  t.log('Proposing question using old charter invitation');
  await governanceDriver.proposeParams(
    VaultFactory,
    { DebtLimit: { brand: debtBrand, value: 300_000_000n } },
    { paramPath: { key: { collateralBrand } } },
    outgoingCommittee[0],
    getQuestionId(3),
    offerIds.propose.outgoing,
  );
  t.like(outgoingCommittee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(3), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  t.log('voting is done by invitations already present and should fail');
  const votePromises = outgoingCommittee
    .slice(0, 2)
    .map(async member =>
      member.voteOnLatestProposal(getVoteId(3), offerIds.vote.outgoing),
    );

  await t.throwsAsync(votePromises[0]);
  await t.throwsAsync(votePromises[1]);

  for (const w of outgoingCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(3), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  const lastOutcome = await governanceDriver.getLatestOutcome();
  const managerParams = getVstorageData(managerGovernanceKey);
  t.notDeepEqual(managerParams.current.DebtLimit.value.value, 300_000_000n);
  t.assert(lastOutcome.outcome === 'fail');
});

test.serial(
  'successful vote by 2 continuing and 1 outgoing members',
  async t => {
    const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
      t.context;
    const committee = [
      ...governanceDriver.ecMembers.slice(0, 2),
      governanceDriver.ecMembers[3],
    ];

    const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
    const { VaultFactory } = agoricNamesRemotes.instance;
    const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

    t.log('Proposing question using old charter invitation');
    await governanceDriver.proposeParams(
      VaultFactory,
      { DebtLimit: { brand: debtBrand, value: 400_000_000n } },
      { paramPath: { key: { collateralBrand } } },
      committee[0],
      getQuestionId(4),
      offerIds.propose.outgoing,
    );
    t.like(committee[0].getLatestUpdateRecord(), {
      status: { id: getQuestionId(4), numWantsSatisfied: 1 },
    });

    t.log('Voting on question using first all wallets');
    t.log('first 2 should pass, last should fail');
    const votePromises = committee.map(async (member, index) =>
      member.voteOnLatestProposal(
        getVoteId(4),
        index === 2 ? offerIds.vote.outgoing : offerIds.vote.incoming,
      ),
    );

    await votePromises[0];
    await votePromises[1];
    await t.throwsAsync(votePromises[2]);

    for (const w of committee) {
      t.like(w.getLatestUpdateRecord(), {
        status: { id: getVoteId(4), numWantsSatisfied: 1 },
      });
    }

    t.log('Waiting for period to end');
    await advanceTimeBy(1, 'minutes');

    const lastOutcome = await governanceDriver.getLatestOutcome();
    const managerParams = getVstorageData(managerGovernanceKey);
    t.deepEqual(managerParams.current.DebtLimit.value.value, 400_000_000n);
    t.assert(lastOutcome.outcome === 'win');
  },
);

test.serial(
  'unsuccessful vote by 1 continuing and 2 outgoing members',
  async t => {
    const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
      t.context;
    const committee = [
      governanceDriver.ecMembers[0],
      ...governanceDriver.ecMembers.slice(3, 5),
    ];

    const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
    const { VaultFactory } = agoricNamesRemotes.instance;
    const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

    t.log('Proposing question using old charter invitation');
    await governanceDriver.proposeParams(
      VaultFactory,
      { DebtLimit: { brand: debtBrand, value: 500_000_000n } },
      { paramPath: { key: { collateralBrand } } },
      committee[0],
      getQuestionId(5),
      offerIds.propose.outgoing,
    );
    t.like(committee[0].getLatestUpdateRecord(), {
      status: { id: getQuestionId(5), numWantsSatisfied: 1 },
    });

    t.log('Voting on question using first all wallets');
    t.log('first 2 should fail, last should pass');
    const votePromises = committee.map(async (member, index) =>
      member.voteOnLatestProposal(
        getVoteId(5),
        index === 0 ? offerIds.vote.incoming : offerIds.vote.outgoing,
      ),
    );

    await votePromises[0];
    await t.throwsAsync(votePromises[1]);
    await t.throwsAsync(votePromises[2]);

    for (const w of committee) {
      t.like(w.getLatestUpdateRecord(), {
        status: { id: getVoteId(5), numWantsSatisfied: 1 },
      });
    }

    t.log('Waiting for period to end');
    await advanceTimeBy(1, 'minutes');

    const lastOutcome = await governanceDriver.getLatestOutcome();
    const managerParams = getVstorageData(managerGovernanceKey);
    t.notDeepEqual(managerParams.current.DebtLimit.value.value, 500_000_000n);
    t.assert(lastOutcome.outcome === 'fail');
  },
);

// Will fail until https://github.com/Agoric/agoric-sdk/issues/10136 is completed
test.failing('outgoing member should not be able to propose', async t => {
  // Ability to propose by outgoing member should still exist
  const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);
  const outgoingMember = governanceDriver.ecMembers[3];

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { VaultFactory } = agoricNamesRemotes.instance;
  const { ATOM: collateralBrand, IST: debtBrand } = agoricNamesRemotes.brand;

  t.log('Proposing question using old charter invitation');
  await governanceDriver.proposeParams(
    VaultFactory,
    { DebtLimit: { brand: debtBrand, value: 300_000_000n } },
    { paramPath: { key: { collateralBrand } } },
    outgoingMember,
    getQuestionId(3),
    offerIds.propose.outgoing,
  );

  t.like(outgoingMember.getLatestUpdateRecord(), {
    status: { id: getQuestionId(3), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  await governanceDriver.enactLatestProposal(
    newCommittee.slice(0, 2),
    getVoteId(3),
    offerIds.vote.incoming,
  );
  for (const w of newCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(3), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');
  const lastOutcome = await governanceDriver.getLatestOutcome();
  const managerParams = getVstorageData(managerGovernanceKey);
  t.notDeepEqual(managerParams.current.DebtLimit.value.value, 300_000_000n);
  t.assert(lastOutcome.outcome === 'win');
});

test.serial('EC can govern auctioneer parameter', async t => {
  const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { auctioneer } = agoricNamesRemotes.instance;

  t.log('Proposing question using new charter invitation');
  await governanceDriver.proposeParams(
    auctioneer,
    { LowestRate: 100_000_000n },
    { paramPath: { key: 'governedParams' } },
    newCommittee[0],
    getQuestionId(4),
    offerIds.propose.incoming,
  );

  t.like(newCommittee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(4), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  await governanceDriver.enactLatestProposal(
    newCommittee.slice(0, 2),
    getVoteId(4),
    offerIds.vote.incoming,
  );
  for (const w of newCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(4), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');
  const lastOutcome = await governanceDriver.getLatestOutcome();
  const auctioneerParams = getVstorageData(auctioneerParamsKey);
  t.deepEqual(auctioneerParams.current.LowestRate.value, 100_000_000n);
  t.assert(lastOutcome.outcome === 'win');
});

test.serial('EC can govern provisionPool parameter', async t => {
  const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { provisionPool } = agoricNamesRemotes.instance;
  const { IST } = agoricNamesRemotes.brand;

  t.log('Proposing question using new charter invitation');
  await governanceDriver.proposeParams(
    provisionPool,
    { PerAccountInitialAmount: { brand: IST, value: 100_000_000n } },
    { paramPath: { key: 'governedParams' } },
    newCommittee[0],
    getQuestionId(5),
    offerIds.propose.incoming,
  );

  t.like(newCommittee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(5), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  await governanceDriver.enactLatestProposal(
    newCommittee.slice(0, 2),
    getVoteId(5),
    offerIds.vote.incoming,
  );
  for (const w of newCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(5), numWantsSatisfied: 1 },
    });
  }

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');
  const lastOutcome = await governanceDriver.getLatestOutcome();
  const provisionPoolParams = getVstorageData(provisionPoolParamsKey);
  t.deepEqual(
    provisionPoolParams.current.PerAccountInitialAmount.value.value,
    100_000_000n,
  );
  t.assert(lastOutcome.outcome === 'win');
});

test.serial('EC can govern reserve parameter', async t => {
  const { storage, advanceTimeBy, governanceDriver, getVstorageData } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { reserve } = agoricNamesRemotes.instance;
  const { IST } = agoricNamesRemotes.brand;

  t.log('Proposing question using new charter invitation for reserve');
  await governanceDriver.proposeApiCall(
    reserve,
    'burnFeesToReduceShortfall',
    [{ brand: IST, value: 1000n }],
    newCommittee[0],
    getQuestionId(6),
    offerIds.propose.incoming,
  );

  t.like(newCommittee[0].getLatestUpdateRecord(), {
    status: { id: getQuestionId(6), numWantsSatisfied: 1 },
  });

  t.log('Voting on question using first 2 wallets');
  await governanceDriver.enactLatestProposal(
    newCommittee.slice(0, 2),
    getVoteId(6),
    offerIds.vote.incoming,
  );
  for (const w of newCommittee.slice(0, 2)) {
    t.like(w.getLatestUpdateRecord(), {
      status: { id: getVoteId(6), numWantsSatisfied: 1 },
    });
  }

  t.log('no oracle invitation should exist before vote passing');
  const oracleInvitation =
    await governanceDriver.ecMembers[0].findOracleInvitation();
  t.is(oracleInvitation, undefined);

  t.log('Checking params before passing proposal');
  const reserveParams = getVstorageData(reserveParamsKey);
  t.is(reserveParams.totalFeeBurned.value, 0n);

  t.log('Waiting for period to end');
  await advanceTimeBy(1, 'minutes');

  t.log('Verifying outcome');
  const lastOutcome = await governanceDriver.getLatestOutcome();
  t.assert(lastOutcome.outcome === 'win');

  const reserveParamsPostUpdate = getVstorageData(reserveParamsKey);
  t.is(reserveParamsPostUpdate.totalFeeBurned.value, 1000n);
});

test.serial('EC can govern psm parameter', async t => {
  const { storage, advanceTimeBy, getVstorageData, governanceDriver } =
    t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);
  const { IST } = agoricNamesRemotes.brand;

  const psmInstances = Object.keys(agoricNamesRemotes.instance)
    .map(instance => {
      const regex = /^psm-IST-(?<brand>.*)$/;
      return regex.exec(instance);
    })
    .filter(instance => instance !== null);

  await null;
  for (const instance of psmInstances) {
    const brand = instance.groups?.brand;
    const instanceName = instance[0];
    t.log('Proposing question using new charter invitation for', instanceName);
    await governanceDriver.proposeParams(
      agoricNamesRemotes.instance[instanceName],
      { MintLimit: { brand: IST, value: 100_000_000n } },
      { paramPath: { key: 'governedParams' } },
      newCommittee[0],
      getQuestionId(instanceName),
      offerIds.propose.incoming,
    );

    t.like(newCommittee[0].getLatestUpdateRecord(), {
      status: { id: getQuestionId(instanceName), numWantsSatisfied: 1 },
    });

    t.log('Voting on question using first 2 wallets');
    await governanceDriver.enactLatestProposal(
      newCommittee.slice(0, 2),
      getVoteId(instanceName),
      offerIds.vote.incoming,
    );
    for (const w of newCommittee.slice(0, 2)) {
      t.like(w.getLatestUpdateRecord(), {
        status: { id: getVoteId(instanceName), numWantsSatisfied: 1 },
      });
    }

    t.log('Waiting for period to end');
    await advanceTimeBy(1, 'minutes');

    t.log('Verifying outcome');
    const lastOutcome = await governanceDriver.getLatestOutcome();
    const psmParams = getVstorageData(getPsmKey(brand));
    t.deepEqual(psmParams.current.MintLimit.value.value, 100_000_000n);
    t.assert(lastOutcome.outcome === 'win');
  }
});

test.serial('EC can make calls to price feed governed APIs', async t => {
  const { storage, advanceTimeBy, governanceDriver } = t.context;
  const newCommittee = governanceDriver.ecMembers.slice(0, 3);

  const agoricNamesRemotes = makeAgoricNamesRemotesFromFakeStorage(storage);

  const priceFeedInstances = Object.keys(agoricNamesRemotes.instance).filter(
    instance => {
      const regex = /^(.*)-(.*) price feed$/;
      return regex.exec(instance);
    },
  );

  await null;
  for (const instanceName of priceFeedInstances) {
    t.log('Proposing question using new charter invitation for', instanceName);
    await governanceDriver.proposeApiCall(
      agoricNamesRemotes.instance[instanceName],
      'addOracles',
      [[wallets[0]]],
      newCommittee[0],
      getQuestionId(instanceName),
      offerIds.propose.incoming,
    );

    t.like(newCommittee[0].getLatestUpdateRecord(), {
      status: { id: getQuestionId(instanceName), numWantsSatisfied: 1 },
    });

    t.log('Voting on question using first 2 wallets');
    await governanceDriver.enactLatestProposal(
      newCommittee.slice(0, 2),
      getVoteId(instanceName),
      offerIds.vote.incoming,
    );
    for (const w of newCommittee.slice(0, 2)) {
      t.like(w.getLatestUpdateRecord(), {
        status: { id: getVoteId(instanceName), numWantsSatisfied: 1 },
      });
    }

    t.log('no oracle invitation should exist before vote passing');
    const oracleInvitation =
      await governanceDriver.ecMembers[0].findOracleInvitation();
    t.is(oracleInvitation, undefined);

    t.log('Waiting for period to end');
    await advanceTimeBy(1, 'minutes');

    t.log('Verifying outcome');
    const lastOutcome = await governanceDriver.getLatestOutcome();
    t.assert(lastOutcome.outcome === 'win');

    const oracleInvitationAfterProposal =
      await governanceDriver.ecMembers[0].findOracleInvitation();
    t.is(passStyleOf(oracleInvitationAfterProposal), 'copyRecord');
  }
});
