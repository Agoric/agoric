import { Fail } from '@endo/errors';
import { mustMatch, M } from '@agoric/store';
import { prepareExo, prepareExoClass } from '@agoric/vat-data';
import { swapExact } from '../contractSupport/index.js';
import { isAfterDeadlineExitRule, OfferHandlerI } from '../typeGuards.js';

const sellSeatExpiredMsg = 'The covered call option is expired.';

/**
 * @see comment on functionality in ./coveredCall.js.
 *
 * This variant has been made durable and upgradeable. The exerciser survives
 * upgrade so the exerciseOption invitation will continue to work after upgrade.
 *
 * The version in
 * zoe/test/swingsetTests/upgradeCoveredCall/coveredCall-durable-V3.js
 * has some minor changes so tests can verify that upgrading from this to that
 * preserves usefulness of the invitation.
 *
 * @param {ZCF} zcf
 * @param {unknown} _privateArgs
 * @param {import('@agoric/vat-data').Baggage} instanceBaggage
 */
const start = async (zcf, _privateArgs, instanceBaggage) => {
  // for use by upgraded versions.
  const firstTime = !instanceBaggage.has('DidStart');
  if (firstTime) {
    instanceBaggage.init('DidStart', true);
  }

  // XXX the exerciseOption offer handler that this makes is an object rather
  // than a function for now only because we do not yet support durable
  // functions.
  const makeExerciser = prepareExoClass(
    instanceBaggage,
    'makeExerciserKindHandle',
    OfferHandlerI,
    sellSeat => ({ sellSeat }),
    {
      handle(buySeat) {
        const {
          state: { sellSeat },
        } = this;
        assert(!sellSeat.hasExited(), sellSeatExpiredMsg);
        try {
          swapExact(zcf, sellSeat, buySeat);
        } catch (err) {
          console.log(
            'Swap failed. Please make sure your offer has the same underlyingAssets and strikePrice as specified in the invitation details. The keywords should not matter.',
            err,
          );
          throw err;
        }
        zcf.shutdown('Swap completed.');
        return 'The option was exercised. Please collect the assets in your payout.';
      },
    },
  );

  /** @type {OfferHandler} */
  const makeOption = async sellSeat => {
    mustMatch(
      sellSeat.getProposal(),
      M.splitRecord({ exit: { afterDeadline: M.any() } }),
      'exit afterDeadline',
    );
    const sellSeatExitRule = sellSeat.getProposal().exit;
    if (!isAfterDeadlineExitRule(sellSeatExitRule)) {
      // TypeScript confused about `||` control flow so use `if` instead
      // https://github.com/microsoft/TypeScript/issues/50739
      throw Fail`the seller must have an afterDeadline exitRule, but instead had ${sellSeatExitRule}`;
    }

    const exerciseOption = makeExerciser(sellSeat);
    const customDetails = harden({
      expirationDate: sellSeatExitRule.afterDeadline.deadline,
      timeAuthority: sellSeatExitRule.afterDeadline.timer,
      underlyingAssets: sellSeat.getProposal().give,
      strikePrice: sellSeat.getProposal().want,
    });
    return zcf.makeInvitation(exerciseOption, 'exerciseOption', customDetails);
  };

  const CoveredCallCreatorFacetI = M.interface('CoveredCallCreatorFacet', {
    makeInvitation: M.call().returns(M.promise()),
  });

  const creatorFacet = prepareExo(
    instanceBaggage,
    'creatorFacet',
    CoveredCallCreatorFacetI,
    {
      makeInvitation() {
        return zcf.makeInvitation(makeOption, 'makeCallOption');
      },
    },
  );
  return harden({ creatorFacet });
};

harden(start);
export { start };
