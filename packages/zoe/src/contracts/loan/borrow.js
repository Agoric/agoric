import { assert, Fail } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makePromiseKit } from '@endo/promise-kit';
import { AmountMath } from '@agoric/ertp';

import {
  assertProposalShape,
  getAmountOut,
  ceilMultiplyBy,
  getTimestamp,
} from '../../contractSupport/index.js';

import { scheduleLiquidation } from './scheduleLiquidation.js';
import { calculateInterest, makeDebtCalculator } from './updateDebt.js';
import { makeCloseLoanInvitation } from './close.js';
import { makeAddCollateralInvitation } from './addCollateral.js';

/** @type {MakeBorrowInvitation} */
export const makeBorrowInvitation = async (zcf, config) => {
  const {
    mmr, // Maintenance Margin Requirement, as a Ratio
    priceAuthority,
    periodNotifier,
    interestRate,
    interestPeriod,
    lenderSeat,
  } = config;

  // We can only lend what the lender has already escrowed.
  const maxLoan = lenderSeat.getAmountAllocated('Loan');

  /** @type {OfferHandler} */
  const borrow = async borrowerSeat => {
    assertProposalShape(borrowerSeat, {
      give: { Collateral: null },
      want: { Loan: null },
    });

    const collateralGiven = borrowerSeat.getAmountAllocated(
      'Collateral',
      /** @type {Brand<'nat'>} */ (
        borrowerSeat.getProposal().give.Collateral.brand
      ),
    );
    const loanWanted = borrowerSeat.getProposal().want.Loan;
    const loanBrand = zcf.getTerms().brands.Loan;

    // The value of the collateral in the Loan brand
    const quote = await E(priceAuthority).quoteGiven(
      collateralGiven,
      loanBrand,
    );

    const collateralPriceInLoanBrand = getAmountOut(quote);

    // Assert the required collateral was escrowed.
    const requiredMargin = ceilMultiplyBy(loanWanted, mmr);
    AmountMath.isGTE(collateralPriceInLoanBrand, requiredMargin) ||
      Fail`The required margin is ${requiredMargin.value}% but collateral only had value of ${collateralPriceInLoanBrand.value}`;

    const timestamp = getTimestamp(quote);

    // Assert that the collateralGiven has not changed after the AWAIT
    assert(
      AmountMath.isEqual(
        collateralGiven,
        borrowerSeat.getAmountAllocated('Collateral'),
      ),
      `The collateral allocated changed during the borrow step, which should not have been possible`,
    );

    // Assert that loanWanted <= maxLoan
    AmountMath.isGTE(maxLoan, loanWanted) ||
      Fail`The wanted loan ${loanWanted} must be below or equal to the maximum possible loan ${maxLoan}`;

    const { zcfSeat: collateralSeat } = zcf.makeEmptySeatKit();

    zcf.atomicRearrange(
      harden([
        // Transfer the wanted Loan amount to the borrower
        [lenderSeat, borrowerSeat, { Loan: loanWanted }],
        // Transfer *all* collateral to the collateral seat.
        [borrowerSeat, collateralSeat, { Collateral: collateralGiven }],
      ]),
    );

    // We now exit the borrower seat so that the borrower gets their
    // loan. However, the borrower gets an object as their offerResult
    // that will let them continue to interact with the contract.
    borrowerSeat.exit();

    const liquidationPromiseKit = makePromiseKit();

    /** @type {DebtCalculatorConfig} */
    const debtCalculatorConfig = {
      calcInterestFn: calculateInterest,
      originalDebt: loanWanted,
      periodNotifier,
      interestRate,
      interestPeriod,
      basetime: timestamp,
      zcf,
      configMinusGetDebt: {
        ...config,
        collateralSeat,
        liquidationPromiseKit,
      },
    };
    const { getDebt, getDebtNotifier, getLastCalculationTimestamp } =
      makeDebtCalculator(harden(debtCalculatorConfig));

    /** @type {LoanConfigWithBorrower} */
    const configWithBorrower = {
      ...config,
      collateralSeat,
      getDebt,
      liquidationPromiseKit,
    };

    // Schedule the liquidation. If the liquidation cannot be scheduled
    // because of a problem with a misconfigured priceAuthority, an
    // error will be thrown and the borrower will be stuck with their
    // loan and the lender will receive the collateral. It is
    // important for the borrower to validate the priceAuthority for
    // this reason.

    scheduleLiquidation(zcf, configWithBorrower);

    // TODO: Add ability to liquidate partially
    // TODO: Add ability to withdraw excess collateral
    // TODO: Add ability to repay partially

    /** @type {BorrowFacet} */
    const borrowFacet = Far('borrowFacet', {
      makeCloseLoanInvitation: async () =>
        makeCloseLoanInvitation(zcf, configWithBorrower),
      makeAddCollateralInvitation: async () =>
        makeAddCollateralInvitation(zcf, configWithBorrower),
      getLiquidationPromise: async () => liquidationPromiseKit.promise,
      getDebtNotifier,
      getLastCalculationTimestamp,
      getRecentCollateralAmount: () =>
        collateralSeat.getAmountAllocated('Collateral'),
    });

    return borrowFacet;
  };

  const customBorrowProps = harden({ maxLoan });

  return zcf.makeInvitation(borrow, 'borrow', customBorrowProps);
};
