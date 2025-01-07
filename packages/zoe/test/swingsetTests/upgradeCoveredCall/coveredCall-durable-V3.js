import { X } from '@endo/errors';
import { M, mustMatch } from '@agoric/store';
import { prepareExoClass, prepareExo } from '@agoric/vat-data';
import { swapExact } from '../../../src/contractSupport/index.js';
import {
  InvitationShape,
  isAfterDeadlineExitRule,
  OfferHandlerI,
} from '../../../src/typeGuards.js';

const sellSeatExpiredMsg = 'The covered call option is expired.';

/** @type {ContractMeta<typeof start>} */
export const meta = {
  upgradability: 'canUpgrade',
};
harden(meta);

/**
 * @see original version in .../zoe/src/contracts/coveredCall.js and upgradeable
 * version in contracts/coveredCall-durable.js.
 *
 * This variant has minor changes to the returned strings that make it
 * identifiable, to demonstrate that upgrade has occurred.
 *
 * @param {ZCF} zcf
 * @param {unknown} _privateArgs
 * @param {import('@agoric/vat-data').Baggage} instanceBaggage
 */
export const start = async (zcf, _privateArgs, instanceBaggage) => {
  const firstTime = !instanceBaggage.has('DidStart');
  if (firstTime) {
    instanceBaggage.init('DidStart', true);
  }
  const upgraded = firstTime ? 'V3 ' : 'V3 upgraded ';

  // TODO the exerciseOption offer handler that this makes is an object rather
  // than a function for now only because we do not yet support durable
  // functions.
  const makeExerciser = prepareExoClass(
    instanceBaggage,
    'makeExerciserKindHandle',
    OfferHandlerI,
    sellSeat => ({ sellSeat }),
    {
      handle(buySeat) {
        const { state } = this;
        assert(!state.sellSeat.hasExited(), sellSeatExpiredMsg);
        try {
          swapExact(zcf, state.sellSeat, buySeat);
        } catch (err) {
          console.log(
            `Swap ${upgraded}failed. Please make sure your offer has the same underlyingAssets and strikePrice as specified in the invitation details. The keywords should not matter.`,
            err,
          );
          throw err;
        }
        zcf.shutdown(`Swap ${upgraded}completed.`);
        return `The ${upgraded}option was exercised. Please collect the assets in your payout.`;
      },
    },
  );

  /** @type {OfferHandler} */
  const makeOption = async sellSeat => {
    mustMatch(
      sellSeat.getProposal(),
      M.split({ exit: { afterDeadline: M.any() } }),
    );
    const sellSeatExitRule = sellSeat.getProposal().exit;
    if (!isAfterDeadlineExitRule(sellSeatExitRule)) {
      // TypeScript confused about `||` control flow so use `if` instead
      // https://github.com/microsoft/TypeScript/issues/50739
      assert.fail(
        X`the seller must have an afterDeadline exitRule, but instead had ${sellSeatExitRule}`,
      );
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

  const CCallCreatorI = M.interface('CCallCreator', {
    makeInvitation: M.call().returns(M.eref(InvitationShape)),
  });

  const creatorFacet = prepareExo(
    instanceBaggage,
    'creatorFacet',
    CCallCreatorI,
    {
      makeInvitation() {
        return zcf.makeInvitation(makeOption, 'makeCallOption');
      },
    },
  );
  return harden({ creatorFacet });
};
harden(start);
