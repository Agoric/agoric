// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';

import { showPurseBalance, setupPurses } from './helpers.js';
import { makePrintLog } from './printLog.js';

const log = makePrintLog();

/**
 * @param {string} name
 * @param {ZoeService} zoe
 * @param {Issuer[]} issuers
 * @param {Payment[]} payments
 * @param {Record<string,Installation>} installations
 */
async function build(name, zoe, issuers, payments, installations) {
  const { moola, simoleans, purses } = await setupPurses(
    zoe,
    issuers,
    payments,
  );
  const [moolaPurseP, simoleanPurseP] = purses;
  const [moolaIssuer, simoleanIssuer] = issuers;
  const issuerKeywordRecord = harden({
    Price: simoleanIssuer,
    Asset: moolaIssuer,
  });
  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const { atomicSwap } = installations;

  async function preReport() {
    await showPurseBalance(moolaPurseP, `${name} moola before`, log);
    await showPurseBalance(simoleanPurseP, `${name} simoleans before`, log);
  }

  async function postReport() {
    await showPurseBalance(moolaPurseP, `${name} moola after`, log);
    await showPurseBalance(simoleanPurseP, `${name} simoleans after`, log);
  }

  async function receivePayouts(payoutsP) {
    const payouts = await payoutsP;
    const moolaPayout = await payouts.Asset;
    const simoleanPayout = await payouts.Price;

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);
  }

  async function initiateSwap(otherP) {
    await preReport();

    const { creatorInvitation: invitation } = await E(zoe).startInstance(
      atomicSwap,
      issuerKeywordRecord,
    );

    const sellProposal = harden({
      give: { Asset: moola(1n) },
      want: { Price: simoleans(1n) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = {
      Asset: await E(moolaPurseP).withdraw(moola(1n)),
    };

    const seatP = E(zoe).offer(invitation, sellProposal, paymentKeywordRecord);
    E(otherP).respondToSwap(E(seatP).getOfferResult());
    const payoutsP = E(seatP).getPayouts();

    await receivePayouts(payoutsP);
    await postReport();
  }

  async function respondToSwap(invitation) {
    await preReport();

    const exclInvitation = await claim(
      E(invitationIssuer).makeEmptyPurse(),
      invitation,
    );

    const buyProposal = harden({
      want: { Asset: moola(1n) },
      give: { Price: simoleans(1n) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = {
      Price: await E(simoleanPurseP).withdraw(simoleans(1n)),
    };

    const seatP = await E(zoe).offer(
      exclInvitation,
      buyProposal,
      paymentKeywordRecord,
    );
    await E(seatP).getOfferResult();
    const payoutsP = E(seatP).getPayouts();

    await receivePayouts(payoutsP);
    await postReport();
  }

  return Far('exchanger', {
    initiateSwap,
    respondToSwap,
  });
}

export function buildRootObject(_vatPowers, vatParameters) {
  return Far('root', {
    build: async (zoe, issuers, payments, installations) =>
      build(vatParameters.name, zoe, issuers, payments, installations),
  });
}
