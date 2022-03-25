// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';
import { showPurseBalance, setupIssuers } from '../helpers.js';

async function logCounter(log, publicAPI) {
  log(`counter: ${await E(publicAPI).getOffersCount()}`);
}

/**
 * @param {any} log
 * @param {ZoeService} zoe
 * @param {any} issuers
 * @param {any} payments
 * @param {any} installations
 */
const build = async (log, zoe, issuers, payments, installations) => {
  const [moolaPayment, simoleansPayment] = payments;
  const [moolaIssuer, simoleanIssuer] = issuers;
  const { moola, simoleans, purses } = await setupIssuers(zoe, issuers);
  const [moolaPurseP, simoleanPurseP] = purses;

  const doThrowInHook = async () => {
    log(`=> alice.doThrowInHook called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );
    const proposal = harden({
      give: { Asset: moola(3n) },
      want: { Price: simoleans(7n) },
      exit: { onDemand: null },
    });
    const alicePayments = { Asset: moolaPayment };

    logCounter(log, publicFacet);
    const invitation = await E(publicFacet).makeThrowingInvitation();
    const seat = await E(zoe).offer(invitation, proposal, alicePayments);

    E(seat)
      .getOfferResult()
      .then(
        () => assert(false, ' expected outcome to fail'),
        e => log(`outcome correctly resolves to broken: ${e}`),
      );
    logCounter(log, publicFacet);
    const moolaPayout = await E(seat).getPayout('Asset');
    const simoleanPayout = await E(seat).getPayout('Price');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);
    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
    logCounter(log, publicFacet);

    // zoe should still be able to make new vats.
    const { publicFacet: publicFacet2 } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );
    log(`newCounter: ${await E(publicFacet2).getOffersCount()}`);

    const newInvitation = await E(publicFacet).makeSafeInvitation();
    const newMoolaPayment = await E(moolaPurseP).withdraw(moola(3n));
    const newPayments = { Asset: newMoolaPayment };

    const secondSeat = await E(zoe).offer(newInvitation, proposal, newPayments);

    E(secondSeat)
      .getOfferResult()
      .then(
        o => log(`Successful refund: ${o}`),
        e => assert(false, X`Expected swap outcome to succeed ${e}`),
      );
    const newPurse = await E(moolaIssuer).makeEmptyPurse();
    const swapMoolaPayout = await E(secondSeat).getPayout('Asset');
    const swapSimoleanPayout = await E(secondSeat).getPayout('Price');
    E(newPurse).deposit(swapMoolaPayout);
    E(simoleanPurseP).deposit(swapSimoleanPayout);

    showPurseBalance(newPurse, 'new Purse', log);
    showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
    logCounter(log, publicFacet);
  };

  const doThrowInApiCall = async () => {
    log(`=> alice.doThrowInApiCall called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );

    const swapProposal = harden({
      give: { Asset: moola(5n) },
      want: { Price: simoleans(8n) },
      exit: { onDemand: null },
    });
    const aliceSwapPayments = { Asset: moolaPayment };
    const swapInvitation = await E(publicFacet).makeSwapInvitation();
    const swapSeat = await E(zoe).offer(
      swapInvitation,
      swapProposal,
      aliceSwapPayments,
    );

    const invitationIssuer = await E(zoe).getInvitationIssuer();
    let swapInvitationTwo;
    E(swapSeat)
      .getOfferResult()
      .then(
        o => {
          E(invitationIssuer)
            .isLive(o)
            .then(val => {
              swapInvitationTwo = o;
              return log(`Swap outcome is an invitation (${val}).`);
            });
        },
        e => assert(false, X`expected outcome not to resolve yet ${e}`),
      );
    logCounter(log, publicFacet);

    E(publicFacet)
      .throwSomething()
      .then(
        () => assert(false, 'expecting this to throw'),
        e => log(`throwingAPI should throw ${e}`),
      );
    logCounter(log, publicFacet);

    // These should not resolve at this point, the funds are still escrowed
    E(swapSeat)
      .getPayouts()
      .then(async swapPayout => {
        const moolaSwapPayout = await swapPayout.Asset;
        const simoleanSwapPayout = await swapPayout.Price;

        await E(moolaPurseP).deposit(moolaSwapPayout);
        await E(simoleanPurseP).deposit(simoleanSwapPayout);
        await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
        await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
      });

    // show that the contract is still responsive.
    logCounter(log, publicFacet);

    // zoe should still be able to make new vats.
    const { publicFacet: publicFacet2 } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );
    log(`newCounter: ${await E(publicFacet2).getOffersCount()}`);

    const swapTwoProposal = harden({
      give: { Price: simoleans(12n) },
      want: { Asset: moola(2n) },
      exit: { onDemand: null },
    });
    assert(swapInvitationTwo);
    const aliceSwapTwoPayments = { Price: simoleansPayment };
    const swapSeatTwo = await E(zoe).offer(
      swapInvitationTwo,
      swapTwoProposal,
      aliceSwapTwoPayments,
    );
    logCounter(log, publicFacet);

    E(swapSeatTwo)
      .getOfferResult()
      .then(
        o => log(`outcome correctly resolves: "${o}"`),
        e => assert(false, X`expected outcome to succeed ${e}`),
      );
    const moolaSwapTwoPayout = await E(swapSeatTwo).getPayout('Asset');
    const simoleanSwapTwoPayout = await E(swapSeatTwo).getPayout('Price');

    const moolaPurse2P = E(moolaIssuer).makeEmptyPurse();
    const simoleanPurse2P = E(simoleanIssuer).makeEmptyPurse();
    await E(moolaPurse2P).deposit(moolaSwapTwoPayout);
    await E(simoleanPurse2P).deposit(simoleanSwapTwoPayout);
    await showPurseBalance(moolaPurse2P, 'second moolaPurse', log);
    await showPurseBalance(simoleanPurse2P, 'second simoleanPurse', log);
  };

  const doThrowInStart = async () => {
    log(`=> alice.doThrowInStart called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    E(zoe)
      .startInstance(installId, issuerKeywordRecord, { throw: true })
      .then(
        () => assert(false, 'contract should not finish creation'),
        e => log(`contract creation failed: ${e}`),
      );

    // We should still be able to create new vats.
    const { publicFacet: publicFacet2 } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );
    log(`newCounter: ${await E(publicFacet2).getOffersCount()}`);
  };

  const doHappyTermination = async () => {
    log(`=> alice.doHappyTermination called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet, adminFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );

    E(adminFacet)
      .getVatShutdownPromise()
      .then(
        reason => {
          return log(`happy termination saw "${reason}"`);
        },
        e => log(`happy termination saw reject "${e}"`),
      );

    E(publicFacet).zcfShutdown('Success');
  };

  // contract attempts a clean shutdown, but there are outstanding seats
  const doHappyTerminationWithOffers = async () => {
    log(`=> alice.doHappyTerminationWOffers called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet, adminFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );

    // wait for the contract to finish.
    E(adminFacet)
      .getVatShutdownPromise()
      .then(
        reason => {
          return log(`happy termination saw "${reason}"`);
        },
        e => log(`happy termination saw reject "${e}"`),
      );

    // Alice submits an offer. The contract will be terminated before resolution
    const swapProposal = harden({
      give: { Asset: moola(5n) },
      want: { Price: simoleans(12n) },
      exit: { onDemand: null },
    });
    const aliceSwapPayments = { Asset: moolaPayment };
    const swapInvitation = await E(publicFacet).makeSwapInvitation();
    const seat = await E(zoe).offer(
      swapInvitation,
      swapProposal,
      aliceSwapPayments,
    );
    E(seat)
      .getOfferResult()
      .then(
        o => log(`Swap outcome resolves to an invitation: ${o}`),
        e => log(`Swap outcome rejected before fulfillment: "${e}"`),
      );

    // contract asks for clean termination
    E(publicFacet).zcfShutdown('Success');
    log(`seat has been exited: ${E(seat).hasExited()}`);

    const moolaSwapRefund = await E(seat).getPayout('Asset');
    const simoleanSwapPayout = await E(seat).getPayout('Price');

    const moolaPurse2P = E(moolaIssuer).makeEmptyPurse();
    const simoleanPurse2P = E(simoleanIssuer).makeEmptyPurse();
    await E(moolaPurse2P).deposit(moolaSwapRefund);
    await E(simoleanPurse2P).deposit(simoleanSwapPayout);
    await showPurseBalance(moolaPurse2P, 'second moolaPurse', log);
    await showPurseBalance(simoleanPurse2P, 'second simoleanPurse', log);
  };

  const doHappyTerminationRefusesContact = async () => {
    log(`=> alice.doHappyTerminationWOffers called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet, adminFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );

    // wait for the contract to finish.
    E(adminFacet)
      .getVatShutdownPromise()
      .then(
        reason => {
          return log(`happy termination saw "${reason}"`);
        },
        e => log(`happy termination saw reject "${e}"`),
      );

    // Alice submits an offer. The contract will be terminated before resolution
    const swapProposal = harden({
      give: { Asset: moola(5n) },
      want: { Price: simoleans(12n) },
      exit: { onDemand: null },
    });
    const aliceSwapPayments = { Asset: moolaPayment };
    const swapInvitation = await E(publicFacet).makeSwapInvitation();

    // contract asks for clean termination
    await E(publicFacet).zcfShutdown('Success');

    await E(zoe)
      .offer(swapInvitation, swapProposal, aliceSwapPayments)
      .then(
        () => log(`fail: expected offer to be refused`),
        e => log(`offer correctly refused: "${e}"`),
      );
    E(publicFacet)
      .makeSwapInvitation()
      .catch(e => log(`can't make more invitations because "${e}"`));
  };

  const doSadTermination = async () => {
    log(`=> alice.doSadTermination called`);
    const installId = installations.crashAutoRefund;

    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { publicFacet, adminFacet } = await E(zoe).startInstance(
      installId,
      issuerKeywordRecord,
    );

    E(adminFacet)
      .getVatShutdownPromise()
      .then(
        reason => {
          return log(`sad termination saw "${reason}"`);
        },
        e => log(`sad termination saw reject "${e}"`),
      );

    E(publicFacet).zcfShutdownWithFailure('Sadness');
  };

  return Far('build', {
    startTest: async testName => {
      switch (testName) {
        case 'throwInOfferHook': {
          return doThrowInHook();
        }
        case 'throwInApiCall': {
          return doThrowInApiCall();
        }
        case 'throwInStart': {
          return doThrowInStart();
        }
        case 'happyTermination': {
          return doHappyTermination();
        }
        case 'happyTerminationWOffers': {
          return doHappyTerminationWithOffers();
        }
        case 'doHappyTerminationRefusesContact': {
          return doHappyTerminationRefusesContact();
        }
        case 'sadTermination': {
          return doSadTermination();
        }
        default: {
          assert.fail(X`testName ${testName} not recognized`);
        }
      }
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: (...args) => build(vatPowers.testLog, ...args),
  });
}
