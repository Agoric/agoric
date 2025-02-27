/// <reference path="./types-ambient.js" />

import { Fail } from '@endo/errors';
import { AmountMath } from '@agoric/ertp';

import { assertProposalShape } from '../../contractSupport/index.js';

// The debt, the amount which must be repaid, is just the amount
// loaned plus interest (aka stability fee). All debt must be repaid
// in one offer. In exchange for total repayment, all collateral is
// given back and the contract is shut down.

/** @type {MakeCloseLoanInvitation} */
export const makeCloseLoanInvitation = (zcf, config) => {
  const { collateralSeat, getDebt, lenderSeat } = config;

  /** @type {OfferHandler} */
  const repayAndClose = repaySeat => {
    assertProposalShape(repaySeat, {
      give: { Loan: null },
      want: { Collateral: null },
    });

    const loanBrand = zcf.getTerms().brands.Loan;
    const collateralBrand = zcf.getTerms().brands.Collateral;

    const repaid = repaySeat.getAmountAllocated('Loan', loanBrand);

    // This must be a function because the amount of debt will change
    // over time as interest is added.
    const debt = getDebt();

    // All debt must be repaid.
    // @ts-expect-error cast?
    AmountMath.isGTE(repaid, debt) ||
      Fail`Not enough Loan assets have been repaid.  ${debt} is required, but only ${repaid} was repaid.`;

    // Transfer the collateral to the repaySeat and remove the
    // required Loan amount. Any excess Loan amount is kept by the repaySeat.
    // Transfer the repaid loan amount to the lender
    const collateralAmount = collateralSeat.getAmountAllocated(
      'Collateral',
      collateralBrand,
    );
    zcf.atomicRearrange(
      harden([
        [collateralSeat, repaySeat, { Collateral: collateralAmount }],
        [repaySeat, lenderSeat, { Loan: debt }],
      ]),
    );

    repaySeat.exit();
    lenderSeat.exit();
    collateralSeat.exit();
    const closeMsg = 'your loan is closed, thank you for your business';
    zcf.shutdown(closeMsg);
    return closeMsg;
  };

  // Note: we can't put the debt to be repaid in the customDetails
  // because it will change
  return zcf.makeInvitation(repayAndClose, 'repayAndClose');
};
