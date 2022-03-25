// @ts-check

import { Far } from '@endo/marshal';

import {
  swap,
  assertIssuerKeywords,
  assertProposalShape,
} from '../../../src/contractSupport/index.js';

import '../../../exported.js';

/**
 * This is an atomic swap contract to test Zoe handling contract failures.
 *
 * This contract throws exceptions in various situations. We want to see that
 * each is handled correctly.
 *
 * @type {ContractStartFn<any>}
 */
const start = zcf => {
  const terms = zcf.getTerms();
  let offersCount = 0n;

  assertIssuerKeywords(zcf, harden(['Asset', 'Price']));

  if (terms.throw) {
    throw new Error('blowup in makeContract');
  }

  const safeAutoRefund = seat => {
    offersCount += 1n;
    seat.exit();
    return `The offer was accepted`;
  };
  const makeSafeInvitation = () =>
    zcf.makeInvitation(safeAutoRefund, 'getRefund');

  const throwing = () => {
    offersCount += 1n;
    throw new Error('someException');
  };
  const makeThrowingInvitation = () =>
    zcf.makeInvitation(throwing, 'getRefund');

  const makeMatchingInvitation = firstSeat => {
    assertProposalShape(firstSeat, {
      give: { Asset: null },
      want: { Price: null },
    });
    offersCount += 1n;
    const { want, give } = firstSeat.getProposal();

    return zcf.makeInvitation(
      secondSeat => swap(zcf, firstSeat, secondSeat),
      'matchOffer',
      harden({
        asset: give.Asset,
        price: want.Price,
      }),
    );
  };

  const zcfShutdown = completion => zcf.shutdown(completion);
  /** @type {ShutdownWithFailure} */
  const zcfShutdownWithFailure = reason => zcf.shutdownWithFailure(reason);

  const makeSwapInvitation = () =>
    zcf.makeInvitation(makeMatchingInvitation, 'firstOffer');

  offersCount += 1n;
  const publicFacet = Far('publicFacet', {
    getOffersCount: () => {
      offersCount += 1n;
      return offersCount;
    },
    makeSafeInvitation,
    makeSwapInvitation,
    makeThrowingInvitation,
    zcfShutdown,
    zcfShutdownWithFailure,
    throwSomething: () => {
      offersCount += 1n;
      throw new Error('someException');
    },
  });

  const creatorInvitation = makeSafeInvitation();

  return harden({ creatorInvitation, publicFacet });
};

harden(start);
export { start };
