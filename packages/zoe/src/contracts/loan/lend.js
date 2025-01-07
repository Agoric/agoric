import { assertProposalShape } from '../../contractSupport/index.js';
import { makeBorrowInvitation } from './borrow.js';

// The lender puts up the amount to be loaned to the borrower, but has
// no further actions. The loan is ongoing until it is paid back
// entirely or liquidated, at which point the lender receives a
// payout. This means that the payout for the lender will be in
// Loan-branded digital assets, not Collateral-brand. (The only
// exception to this is if the scheduling of liquidation triggers with
// the priceAuthority results in a error. In that case, we have no
// choice but to give the collateral to the lender. The borrower has
// already exited with their loan.)

/** @type {MakeLendInvitation} */
export const makeLendInvitation = async (zcf, config) => {
  /** @type {OfferHandler} */
  const lend = async lenderSeat => {
    // Lender will want the interest earned from the loan + their
    // refund or the results of the liquidation. If the price of
    // collateral drops before we get the chance to liquidate, the
    // total payout could be zero. Therefore, the lender cannot `want`
    // anything in their proposal.

    // If the exit rule was `waived`, a borrower would be able to hold
    // on to their invitation and effectively lock up the lender's
    // Loan forever. Thus, the lender must be able to exit on
    // demand until the borrowing occurs. When the borrowing occurs,
    // the collateral is moved to a special collateral seat to prevent
    // the lender from being able to exit with collateral before the
    // contract ends through repayment or liquidation.
    assertProposalShape(lenderSeat, {
      want: {}, // No return can be guaranteed.
      give: { Loan: null },
      exit: { onDemand: null }, // The lender must be able to exit with their loan at any time before the money is borrowed
    });

    const configWithLenderSeat = { ...config, lenderSeat };
    return makeBorrowInvitation(zcf, configWithLenderSeat);
  };

  return zcf.makeInvitation(lend, 'lend');
};
