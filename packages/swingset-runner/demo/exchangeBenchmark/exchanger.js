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
 * @param {{ makeInvitation: () => Invitation }} publicFacet
 */
async function build(name, zoe, issuers, payments, publicFacet) {
  const { moola, simoleans, purses } = await setupPurses(
    zoe,
    issuers,
    payments,
  );
  const [moolaPurseP, simoleanPurseP] = purses;

  const invitationIssuer = await E(zoe).getInvitationIssuer();

  async function preReport(quiet) {
    const useLog = quiet ? () => {} : log;
    await showPurseBalance(moolaPurseP, `${name} moola before`, useLog);
    await showPurseBalance(simoleanPurseP, `${name} simoleans before`, useLog);
  }

  async function postReport(quiet) {
    const useLog = quiet ? () => {} : log;
    await showPurseBalance(moolaPurseP, `${name} moola after`, useLog);
    await showPurseBalance(simoleanPurseP, `${name} simoleans after`, useLog);
  }

  async function receivePayout(payoutP) {
    const payout = await payoutP;
    const moolaPayout = await payout.Asset;
    const simoleanPayout = await payout.Price;

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);
  }

  async function initiateTrade(otherP, quiet) {
    await preReport(quiet);

    const buyOrderInvitation = await E(publicFacet).makeInvitation();

    const mySellOrderProposal = harden({
      give: { Asset: moola(1n) },
      want: { Price: simoleans(1n) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = {
      Asset: await E(moolaPurseP).withdraw(moola(1n)),
    };
    const seat = await E(zoe).offer(
      buyOrderInvitation,
      mySellOrderProposal,
      paymentKeywordRecord,
    );
    const payoutP = E(seat).getPayouts();

    const invitationP = E(publicFacet).makeInvitation();
    await E(otherP).respondToTrade(invitationP, quiet);

    await receivePayout(payoutP);
    await postReport(quiet);
  }

  async function respondToTrade(invitationP, quiet) {
    await preReport(quiet);

    const invitation = await invitationP;
    const exclInvitation = await claim(
      E(invitationIssuer).makeEmptyPurse(),
      invitation,
    );

    const myBuyOrderProposal = harden({
      want: { Asset: moola(1n) },
      give: { Price: simoleans(1n) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = {
      Price: await E(simoleanPurseP).withdraw(simoleans(1n)),
    };

    const seatP = await E(zoe).offer(
      exclInvitation,
      myBuyOrderProposal,
      paymentKeywordRecord,
    );
    const payoutP = E(seatP).getPayouts();

    await receivePayout(payoutP);
    await postReport(quiet);
  }

  return Far('exchanger', {
    initiateTrade,
    respondToTrade,
  });
}

export function buildRootObject(_vatPowers, vatParameters) {
  return Far('root', {
    build: async (zoe, issuers, payments, publicFacet) =>
      build(vatParameters.name, zoe, issuers, payments, publicFacet),
  });
}
