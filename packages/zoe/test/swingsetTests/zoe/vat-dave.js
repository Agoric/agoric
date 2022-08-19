// @ts-check

import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { assert, details as X } from '@agoric/assert';
import { keyEQ } from '@agoric/store';
import { AmountMath } from '@agoric/ertp';
import { showPurseBalance, setupIssuers } from '../helpers.js';

const build = async (log, zoe, issuers, payments, installations, timer) => {
  const { moola, simoleans, bucks, purses } = await setupIssuers(zoe, issuers);
  const [moolaPurseP, simoleanPurseP, bucksPurseP] = purses;
  const [_moolaPayment, simoleanPayment, bucksPayment] = payments;
  const [moolaIssuer, simoleanIssuer, bucksIssuer] = issuers;
  const invitationIssuer = await E(zoe).getInvitationIssuer();

  let secondPriceAuctionSeatP;

  return Far('build', {
    doSecondPriceAuctionBid: async invitation => {
      const instance = await E(zoe).getInstance(invitation);
      const installation = await E(zoe).getInstallation(invitation);
      const issuerKeywordRecord = await E(zoe).getIssuers(instance);
      const exclInvitation = await E(invitationIssuer).claim(invitation);
      const { value: invitationValue } = await E(invitationIssuer).getAmountOf(
        exclInvitation,
      );

      assert(
        installation === installations.secondPriceAuction,
        X`wrong installation`,
      );
      assert(
        keyEQ(
          harden({ Asset: moolaIssuer, Ask: simoleanIssuer }),
          issuerKeywordRecord,
        ),
        X`issuerKeywordRecord were not as expected`,
      );
      assert(keyEQ(invitationValue[0].minimumBid, simoleans(3n)));
      assert(keyEQ(invitationValue[0].auctionedAssets, moola(1n)));

      const proposal = harden({
        want: { Asset: moola(1n) },
        give: { Bid: simoleans(5n) },
        exit: { onDemand: null },
      });
      const paymentKeywordRecord = { Bid: simoleanPayment };

      secondPriceAuctionSeatP = await E(zoe).offer(
        exclInvitation,
        proposal,
        paymentKeywordRecord,
      );
      log(`Dave: ${await E(secondPriceAuctionSeatP).getOfferResult()}`);
    },
    doSecondPriceAuctionGetPayout: async () => {
      const moolaPayout = await E(secondPriceAuctionSeatP).getPayout('Asset');
      const simoleanPayout = await E(secondPriceAuctionSeatP).getPayout('Bid');

      await E(moolaPurseP).deposit(moolaPayout);
      await E(simoleanPurseP).deposit(simoleanPayout);

      await showPurseBalance(moolaPurseP, 'daveMoolaPurse', log);
      await showPurseBalance(simoleanPurseP, 'daveSimoleanPurse', log);
    },

    doSwapForOption: async (invitation, optionAmounts) => {
      // Dave is looking to buy the option to trade his 7 simoleans for
      // 3 moola, and is willing to pay 1 buck for the option.
      const instance = await E(zoe).getInstance(invitation);
      const installation = await E(zoe).getInstallation(invitation);
      const issuerKeywordRecord = await E(zoe).getIssuers(instance);
      const exclInvitation = await E(invitationIssuer).claim(invitation);
      const { value: invitationValue } = await E(invitationIssuer).getAmountOf(
        exclInvitation,
      );

      // TODO Check the integrity of the installation by its hash.
      // https://github.com/Agoric/agoric-sdk/issues/3859
      // const installation = await E(zoe).getInstallation(invitation);
      // const hash = await E(installation).getHash();
      // assert.is(hash, 'XXX');

      assert.equal(
        installation,
        installations.atomicSwap,
        X`wrong installation`,
      );
      assert(
        keyEQ(
          harden({ Asset: invitationIssuer, Price: bucksIssuer }),
          issuerKeywordRecord,
        ),
        X`issuerKeywordRecord were not as expected`,
      );

      // Dave expects that Bob has already made an offer in the swap
      // with the following rules:
      assert(
        keyEQ(invitationValue[0].asset, optionAmounts),
        X`asset is the option`,
      );
      assert(keyEQ(invitationValue[0].price, bucks(1n)), X`price is 1 buck`);
      const optionValue = optionAmounts.value;
      assert(
        optionValue[0].description === 'exerciseOption',
        X`wrong invitation`,
      );
      assert(
        AmountMath.isEqual(
          optionValue[0].underlyingAssets.UnderlyingAsset,
          moola(3n),
        ),
        X`wrong underlying asset`,
      );
      assert(
        AmountMath.isEqual(
          optionValue[0].strikePrice.StrikePrice,
          simoleans(7n),
        ),
        X`wrong strike price`,
      );
      assert.equal(
        optionValue[0].expirationDate,
        100n,
        X`wrong expiration date`,
      );
      assert.equal(optionValue[0].timeAuthority, timer, X`wrong timer`);

      // Dave escrows his 1 buck with Zoe and forms his proposal
      const daveSwapProposal = harden({
        want: { Asset: optionAmounts },
        give: { Price: bucks(1n) },
      });
      const daveSwapPayments = harden({ Price: bucksPayment });
      const seatP = await E(zoe).offer(
        exclInvitation,
        daveSwapProposal,
        daveSwapPayments,
      );

      log(await E(seatP).getOfferResult());

      const daveOption = await E(seatP).getPayout('Asset');
      const daveBucksPayout = await E(seatP).getPayout('Price');

      // Dave exercises his option by making an offer to the covered
      // call. First, he escrows with Zoe.

      const daveCoveredCallProposal = harden({
        want: { UnderlyingAsset: moola(3n) },
        give: { StrikePrice: simoleans(7n) },
      });
      const daveCoveredCallPayments = harden({ StrikePrice: simoleanPayment });
      const optionSeatP = await E(zoe).offer(
        daveOption,
        daveCoveredCallProposal,
        daveCoveredCallPayments,
      );

      log(await E(optionSeatP).getOfferResult());

      const moolaPayout = await E(optionSeatP).getPayout('UnderlyingAsset');
      const simoleanPayout = await E(optionSeatP).getPayout('StrikePrice');

      await E(bucksPurseP).deposit(daveBucksPayout);
      await E(moolaPurseP).deposit(moolaPayout);
      await E(simoleanPurseP).deposit(simoleanPayout);

      await showPurseBalance(moolaPurseP, 'daveMoolaPurse', log);
      await showPurseBalance(simoleanPurseP, 'daveSimoleanPurse', log);
      await showPurseBalance(bucksPurseP, 'daveBucksPurse', log);
    },
  });
};

export function buildRootObject(vatPowers) {
  return Far('root', {
    build: (...args) => build(vatPowers.testLog, ...args),
  });
}
