// @ts-check
import { assert } from '@endo/errors';
import { E } from '@endo/far';
// Avoid pulling in too many dependencies like notifiers
import { AmountMath } from '@agoric/ertp/src/amountMath.js';

/** @import {Petname} from '@agoric/deploy-script-support/src/externalTypes.js' */

/**
 * @typedef {object} OfferHelperConfig
 * @property {ERef<Invitation>} [invitation]
 * @property {Partial<InvitationDetails>} [partialInvitationDetails]
 * @property {Proposal} proposal
 * @property {Record<Keyword, Petname>} paymentsWithPursePetnames
 * @property {Record<Keyword, Petname>} payoutPursePetnames
 */

/**
 * @param {ERef<any>} walletAdmin - an internal type of the
 * wallet, not defined here
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Purse<'set', InvitationDetails>>} zoeInvitationPurse
 */
export const makeOfferAndFindInvitationAmount = (
  walletAdmin,
  zoe,
  zoeInvitationPurse,
) => {
  /**
   * @param {Record<string, any>} invitationDetailsCriteria
   * @returns {Promise<InvitationAmount>} invitationAmount
   */
  const findInvitationAmount = async invitationDetailsCriteria => {
    const invitationAmount = await E(zoeInvitationPurse).getCurrentAmount();

    // For every key and value in invitationDetailsCriteria, return an amount
    // with any matches for those exact keys and values. Keys not in
    // invitationDetails count as a match
    const matches = invitationDetail =>
      Object.entries(invitationDetailsCriteria).every(
        ([key, value]) => invitationDetail[key] === value,
      );

    const invitationValue = invitationAmount.value;
    assert(Array.isArray(invitationValue));
    const matchingValue = invitationValue.find(matches);
    const value =
      matchingValue === undefined ? harden([]) : harden([matchingValue]);
    return AmountMath.make(invitationAmount.brand, value);
  };

  const withdrawPayments = (proposal, paymentsWithPursePetnames) => {
    return Object.fromEntries(
      Object.entries(paymentsWithPursePetnames).map(
        ([keyword, pursePetname]) => {
          const purse = E(walletAdmin).getPurse(pursePetname);
          const amountToWithdraw = proposal.give[keyword];
          const paymentP = E(purse).withdraw(amountToWithdraw);
          return [keyword, paymentP];
        },
      ),
    );
  };

  const withdrawInvitation = async invitationDetails => {
    // Let's go with the first one that fits our requirements
    const invitationAmount = await findInvitationAmount(invitationDetails);
    return E(zoeInvitationPurse).withdraw(invitationAmount);
  };

  const getInvitation = (invitation, invitationDetails) => {
    if (invitation !== undefined) {
      return invitation;
    }
    assert(
      invitationDetails,
      `either an invitation or invitationDetails is required`,
    );
    return withdrawInvitation(invitationDetails);
  };

  const depositPayouts = async (seat, payoutPursePetnames) => {
    const makeDepositInPurse = keyword => {
      const deposit = payment => {
        const pursePetname = payoutPursePetnames[keyword];
        const purse = E(walletAdmin).getPurse(pursePetname);
        return E(purse).deposit(payment);
      };
      return deposit;
    };
    const handlePayments = async paymentsP => {
      const allDepositedP = Promise.all(
        Object.entries(paymentsP).map(async ([keyword, paymentP]) => {
          const depositInPurse = makeDepositInPurse(keyword);
          return E.when(paymentP, depositInPurse);
        }),
      );
      return allDepositedP;
    };
    const paymentsPP = E(seat).getPayouts();
    return E.when(paymentsPP, handlePayments);
  };

  /**
   * @param {OfferHelperConfig} config
   */
  const offer = async config => {
    const {
      invitation,
      partialInvitationDetails,
      proposal,
      paymentsWithPursePetnames,
      payoutPursePetnames,
    } = config;

    const invitationToUse = getInvitation(invitation, partialInvitationDetails);
    const invitationDetails =
      await E(zoe).getInvitationDetails(invitationToUse);
    const payments = withdrawPayments(proposal, paymentsWithPursePetnames);

    const seat = E(zoe).offer(invitationToUse, proposal, payments);

    const deposited = depositPayouts(seat, payoutPursePetnames);

    const offerResultP = E(seat).getOfferResult();
    await E(walletAdmin).saveOfferResult(
      invitationDetails.handle,
      offerResultP,
    );
    return {
      seat,
      deposited,
      invitationDetails,
    };
  };
  return {
    offer,
    findInvitationAmount,
  };
};
