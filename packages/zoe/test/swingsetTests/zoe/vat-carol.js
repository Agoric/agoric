import { assert, X } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { keyEQ } from '@agoric/store';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';
import { showPurseBalance, setupIssuers } from '../helpers.js';

const build = async (log, zoe, issuers, payments, installations) => {
  const { moola, simoleans, purses } = await setupIssuers(zoe, issuers);
  const [moolaPurseP, simoleanPurseP] = purses;
  const [_moolaPayment, simoleanPayment] = payments;
  const [moolaIssuer, simoleanIssuer] = issuers;
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  let secondPriceAuctionSeatP;

  return Far('build', {
    doSecondPriceAuctionBid: async invitationP => {
      const invitation = await claim(
        E(invitationIssuer).makeEmptyPurse(),
        invitationP,
      );
      const instance = await E(zoe).getInstance(invitation);
      const installation = await E(zoe).getInstallation(invitation);
      const issuerKeywordRecord = await E(zoe).getIssuers(instance);
      const { value: invitationValue } =
        await E(invitationIssuer).getAmountOf(invitation);
      installation === installations.secondPriceAuction ||
        assert.fail(X`wrong installation`);
      assert(
        keyEQ(
          harden({ Asset: moolaIssuer, Ask: simoleanIssuer }),
          issuerKeywordRecord,
        ),
        X`issuerKeywordRecord were not as expected`,
      );
      assert(
        keyEQ(invitationValue[0].customDetails?.minimumBid, simoleans(3n)),
      );
      assert(
        keyEQ(invitationValue[0].customDetails?.auctionedAssets, moola(1n)),
      );

      const proposal = harden({
        want: { Asset: moola(1n) },
        give: { Bid: simoleans(7n) },
        exit: { onDemand: null },
      });
      const paymentKeywordRecord = { Bid: simoleanPayment };

      secondPriceAuctionSeatP = await E(zoe).offer(
        invitation,
        proposal,
        paymentKeywordRecord,
      );
      log(`Carol: ${await E(secondPriceAuctionSeatP).getOfferResult()}`);
    },
    doSecondPriceAuctionGetPayout: async () => {
      const moolaPayout = await E(secondPriceAuctionSeatP).getPayout('Asset');
      const simoleanPayout = await E(secondPriceAuctionSeatP).getPayout('Bid');

      await E(moolaPurseP).deposit(moolaPayout);
      await E(simoleanPurseP).deposit(simoleanPayout);

      await showPurseBalance(moolaPurseP, 'carolMoolaPurse', log);
      await showPurseBalance(simoleanPurseP, 'carolSimoleanPurse', log);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: async (...args) => build(vatPowers.testLog, ...args),
  });
}
