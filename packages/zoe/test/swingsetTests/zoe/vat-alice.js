import { E } from '@agoric/eventual-send';
import { makeLocalAmountMath } from '@agoric/ertp/src/issuer';
import { showPurseBalance, setupIssuers } from '../helpers';

const build = async (log, zoe, issuers, payments, installations, timer) => {
  const { moola, simoleans, purses } = await setupIssuers(zoe, issuers);
  const [moolaPurseP, simoleanPurseP] = purses;
  const [moolaPayment, simoleanPayment] = payments;
  const [moolaIssuer, simoleanIssuer] = issuers;

  const doAutomaticRefund = async bobP => {
    log(`=> alice.doCreateAutomaticRefund called`);
    const installId = installations.automaticRefund;
    const issuerKeywordRecord = harden({
      Contribution1: moolaIssuer,
      Contribution2: simoleanIssuer,
    });
    const { publicFacet, creatorInvitation: refundInvite } = await E(
      zoe,
    ).startInstance(installId, issuerKeywordRecord);

    const proposal = harden({
      give: { Contribution1: moola(3) },
      want: { Contribution2: simoleans(7) },
      exit: { onDemand: null },
    });

    const paymentKeywordRecord = { Contribution1: moolaPayment };
    const refundSeatP = await E(zoe).offer(
      refundInvite,
      proposal,
      paymentKeywordRecord,
    );
    log(await E(refundSeatP).getOfferResult());

    const bobInvite = E(publicFacet).makeInvitation();
    await E(bobP).doAutomaticRefund(bobInvite);
    const moolaPayout = await E(refundSeatP).getPayout('Contribution1');
    const simoleanPayout = await E(refundSeatP).getPayout('Contribution2');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doCoveredCall = async bobP => {
    log(`=> alice.doCreateCoveredCall called`);
    const installation = installations.coveredCall;
    const issuerKeywordRecord = harden({
      UnderlyingAsset: moolaIssuer,
      StrikePrice: simoleanIssuer,
    });
    const { creatorInvitation: writeCallInvitation } = await E(
      zoe,
    ).startInstance(installation, issuerKeywordRecord);

    const proposal = harden({
      give: { UnderlyingAsset: moola(3) },
      want: { StrikePrice: simoleans(7) },
      exit: { afterDeadline: { deadline: 1, timer } },
    });

    const paymentKeywordRecord = { UnderlyingAsset: moolaPayment };
    const seatP = await E(zoe).offer(
      writeCallInvitation,
      proposal,
      paymentKeywordRecord,
    );

    const optionP = E(seatP).getOfferResult();
    await E(bobP).doCoveredCall(optionP);
    const moolaPayout = await E(seatP).getPayout('UnderlyingAsset');
    const simoleanPayout = await E(seatP).getPayout('StrikePrice');
    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doSwapForOption = async (bobP, _carolP, daveP) => {
    log(`=> alice.doSwapForOption called`);
    const issuerKeywordRecord = harden({
      UnderlyingAsset: moolaIssuer,
      StrikePrice: simoleanIssuer,
    });
    const { creatorInvitation: writeCallInvite } = await E(zoe).startInstance(
      installations.coveredCall,
      issuerKeywordRecord,
    );

    const proposal = harden({
      give: { UnderlyingAsset: moola(3) },
      want: { StrikePrice: simoleans(7) },
      exit: {
        afterDeadline: {
          deadline: 100,
          timer,
        },
      },
    });

    const paymentKeywordRecord = harden({ UnderlyingAsset: moolaPayment });
    const seatP = await E(zoe).offer(
      writeCallInvite,
      proposal,
      paymentKeywordRecord,
    );

    log('call option made');
    const inviteForBob = E(seatP).getOfferResult();
    await E(bobP).doSwapForOption(inviteForBob, daveP);
    const moolaPayout = await E(seatP).getPayout('UnderlyingAsset');
    const simoleanPayout = await E(seatP).getPayout('StrikePrice');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doPublicAuction = async (bobP, carolP, daveP) => {
    const numBidsAllowed = 3;
    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Ask: simoleanIssuer,
    });
    const terms = harden({ numBidsAllowed });
    const { creatorInvitation: sellAssetsInvite } = await E(zoe).startInstance(
      installations.publicAuction,
      issuerKeywordRecord,
      terms,
    );

    const proposal = harden({
      give: { Asset: moola(1) },
      want: { Ask: simoleans(3) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = { Asset: moolaPayment };
    const aliceSeatP = await E(zoe).offer(
      sellAssetsInvite,
      proposal,
      paymentKeywordRecord,
    );

    const makeBidInvitationObj = await E(aliceSeatP).getOfferResult();
    const bobInvitation = E(makeBidInvitationObj).makeBidInvitation();
    const carolInvitation = E(makeBidInvitationObj).makeBidInvitation();
    const daveInvitation = E(makeBidInvitationObj).makeBidInvitation();

    const bobDoneP = E(bobP).doPublicAuction(bobInvitation);
    const carolDoneP = E(carolP).doPublicAuction(carolInvitation);
    const daveDoneP = E(daveP).doPublicAuction(daveInvitation);

    await Promise.all([bobDoneP, carolDoneP, daveDoneP]);

    const moolaPayout = await E(aliceSeatP).getPayout('Asset');
    const simoleanPayout = await E(aliceSeatP).getPayout('Ask');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doAtomicSwap = async bobP => {
    const issuerKeywordRecord = harden({
      Asset: moolaIssuer,
      Price: simoleanIssuer,
    });
    const { creatorInvitation: firstOfferInvite } = await E(zoe).startInstance(
      installations.atomicSwap,
      issuerKeywordRecord,
    );

    const proposal = harden({
      give: { Asset: moola(3) },
      want: { Price: simoleans(7) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = { Asset: moolaPayment };
    const seatP = await E(zoe).offer(
      firstOfferInvite,
      proposal,
      paymentKeywordRecord,
    );

    E(bobP).doAtomicSwap(E(seatP).getOfferResult());

    const moolaPayout = await E(seatP).getPayout('Asset');
    const simoleanPayout = await E(seatP).getPayout('Price');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doSimpleExchange = async bobP => {
    const issuerKeywordRecord = harden({
      Price: simoleanIssuer,
      Asset: moolaIssuer,
    });
    const { simpleExchange } = installations;
    const { publicFacet } = await E(zoe).startInstance(
      simpleExchange,
      issuerKeywordRecord,
    );

    const addOrderInvite = await E(publicFacet).makeInvitation();
    const aliceSellOrderProposal = harden({
      give: { Asset: moola(3) },
      want: { Price: simoleans(4) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = { Asset: moolaPayment };
    const addOrderSeatP = await E(zoe).offer(
      addOrderInvite,
      aliceSellOrderProposal,
      paymentKeywordRecord,
    );

    log(await E(addOrderSeatP).getOfferResult());

    const bobInviteP = E(publicFacet).makeInvitation();
    await E(bobP).doSimpleExchange(bobInviteP);
    const moolaPayout = await E(addOrderSeatP).getPayout('Asset');
    const simoleanPayout = await E(addOrderSeatP).getPayout('Price');

    await E(moolaPurseP).deposit(await moolaPayout);
    await E(simoleanPurseP).deposit(await simoleanPayout);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  function logStateOnChanges(notifier, lastCount = undefined) {
    const updateRecordP = E(notifier).getUpdateSince(lastCount);
    updateRecordP.then(updateRec => {
      log(updateRec.value);
      logStateOnChanges(notifier, updateRec.updateCount);
    });
  }

  const doSimpleExchangeWithNotification = async bobP => {
    const issuerKeywordRecord = harden({
      Price: simoleanIssuer,
      Asset: moolaIssuer,
    });
    const { simpleExchange } = installations;
    const { publicFacet } = await E(zoe).startInstance(
      simpleExchange,
      issuerKeywordRecord,
    );

    logStateOnChanges(await E(publicFacet).getNotifier());

    const aliceSellOrderProposal = harden({
      give: { Asset: moola(3) },
      want: { Price: simoleans(4) },
      exit: { onDemand: null },
    });
    const paymentKeywordRecord = { Asset: moolaPayment };
    const addOrderInvite = await E(publicFacet).makeInvitation();
    const addOrderSeatP = await E(zoe).offer(
      addOrderInvite,
      aliceSellOrderProposal,
      paymentKeywordRecord,
    );

    log(await E(addOrderSeatP).getOfferResult());

    const bobInvite1P = E(publicFacet).makeInvitation();
    await E(bobP).doSimpleExchangeUpdates(bobInvite1P, 3, 7);
    const bobInvite2P = E(publicFacet).makeInvitation();
    await E(bobP).doSimpleExchangeUpdates(bobInvite2P, 8, 2);

    const moolaPayout = await E(addOrderSeatP).getPayout('Asset');
    const simoleanPayout = await E(addOrderSeatP).getPayout('Price');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);
    const bobInvite3P = E(publicFacet).makeInvitation();
    await E(bobP).doSimpleExchangeUpdates(bobInvite3P, 20, 13);
    const bobInvite4P = E(publicFacet).makeInvitation();
    await E(bobP).doSimpleExchangeUpdates(bobInvite4P, 5, 2);
    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
  };

  const doAutoswap = async bobP => {
    const issuerKeywordRecord = harden({
      TokenA: moolaIssuer,
      TokenB: simoleanIssuer,
    });
    const { publicFacet, instance } = await E(zoe).startInstance(
      installations.autoswap,
      issuerKeywordRecord,
    );
    const liquidityIssuer = await E(publicFacet).getLiquidityIssuer();
    const liquidityAmountMath = await makeLocalAmountMath(liquidityIssuer);
    const liquidity = liquidityAmountMath.make;

    // Alice adds liquidity
    // 10 moola = 5 simoleans at the time of the liquidity adding
    // aka 2 moola = 1 simolean
    const addLiquidityProposal = harden({
      give: { TokenA: moola(10), TokenB: simoleans(5) },
      want: { Liquidity: liquidity(10) },
    });
    const paymentKeywordRecord = harden({
      TokenA: moolaPayment,
      TokenB: simoleanPayment,
    });
    const addLiquidityInvite = E(publicFacet).makeAddLiquidityInvite();
    const addLiqSeatP = await E(zoe).offer(
      addLiquidityInvite,
      addLiquidityProposal,
      paymentKeywordRecord,
    );

    log(await E(addLiqSeatP).getOfferResult());

    const liquidityPayout = await E(addLiqSeatP).getPayout('Liquidity');

    const liquidityTokenPurseP = E(liquidityIssuer).makeEmptyPurse();
    await E(liquidityTokenPurseP).deposit(liquidityPayout);

    await E(bobP).doAutoswap(instance);

    // remove the liquidity
    const aliceRemoveLiquidityProposal = harden({
      give: { Liquidity: liquidity(10) },
      want: { TokenA: moola(0), TokenB: simoleans(0) },
    });

    const liquidityTokenPayment = await E(liquidityTokenPurseP).withdraw(
      liquidity(10),
    );
    const removeLiquidityInvite = E(publicFacet).makeRemoveLiquidityInvite();

    const removeLiquiditySeatP = await E(zoe).offer(
      removeLiquidityInvite,
      aliceRemoveLiquidityProposal,
      harden({ Liquidity: liquidityTokenPayment }),
    );

    log(await E(removeLiquiditySeatP).getOfferResult());

    const moolaPayout = await E(removeLiquiditySeatP).getPayout('TokenA');
    const simoleanPayout = await E(removeLiquiditySeatP).getPayout('TokenB');

    await E(moolaPurseP).deposit(moolaPayout);
    await E(simoleanPurseP).deposit(simoleanPayout);

    const poolAmounts = await E(publicFacet).getPoolAllocation();

    log(`poolAmounts`, poolAmounts);

    await showPurseBalance(moolaPurseP, 'aliceMoolaPurse', log);
    await showPurseBalance(simoleanPurseP, 'aliceSimoleanPurse', log);
    await showPurseBalance(
      liquidityTokenPurseP,
      'aliceLiquidityTokenPurse',
      log,
    );
  };

  const doSellTickets = async bobP => {
    const { mintAndSellNFT } = installations;
    const { creatorFacet } = await E(zoe).startInstance(mintAndSellNFT);

    // completeObj exists because of a current limitation in @agoric/marshal : https://github.com/Agoric/agoric-sdk/issues/818
    const {
      sellItemsInstance: ticketSalesInstance,
      sellItemsCreatorSeat,
      sellItemsPublicFacet,
      sellItemsCreatorFacet,
    } = await E(creatorFacet).sellTokens({
      customValueProperties: {
        show: 'Steven Universe, the Opera',
        start: 'Wed, March 25th 2020 at 8pm',
      },
      count: 3,
      moneyIssuer: moolaIssuer,
      sellItemsInstallation: installations.sellItems,
      pricePerItem: moola(22),
    });
    const buyerInvite = E(sellItemsCreatorFacet).makeBuyerInvite();
    await E(bobP).doBuyTickets(ticketSalesInstance, buyerInvite);

    const availableTickets = await E(sellItemsPublicFacet).getAvailableItems();

    log('after ticket1 purchased: ', availableTickets);

    await E(sellItemsCreatorSeat).exit();

    const moneyPayment = await E(sellItemsCreatorSeat).getPayout('Money');
    await E(moolaPurseP).deposit(moneyPayment);
    const currentPurseBalance = await E(moolaPurseP).getCurrentAmount();

    log('alice earned: ', currentPurseBalance);
  };

  return harden({
    startTest: async (testName, bobP, carolP, daveP) => {
      switch (testName) {
        case 'automaticRefundOk': {
          return doAutomaticRefund(bobP, carolP, daveP);
        }
        case 'coveredCallOk': {
          return doCoveredCall(bobP, carolP, daveP);
        }
        case 'swapForOptionOk': {
          return doSwapForOption(bobP, carolP, daveP);
        }
        case 'publicAuctionOk': {
          return doPublicAuction(bobP, carolP, daveP);
        }
        case 'atomicSwapOk': {
          return doAtomicSwap(bobP, carolP, daveP);
        }
        case 'simpleExchangeOk': {
          return doSimpleExchange(bobP, carolP, daveP);
        }
        case 'simpleExchangeNotifier': {
          return doSimpleExchangeWithNotification(bobP, carolP, daveP);
        }
        case 'autoswapOk': {
          return doAutoswap(bobP, carolP, daveP);
        }
        case 'sellTicketsOk': {
          return doSellTickets(bobP, carolP, daveP);
        }
        default: {
          throw new Error(`testName ${testName} not recognized`);
        }
      }
    },
  });
};

export function buildRootObject(vatPowers) {
  return harden({
    build: (...args) => build(vatPowers.testLog, ...args),
  });
}
