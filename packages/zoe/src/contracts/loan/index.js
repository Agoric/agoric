// @ts-check

import '../../../exported.js';

import { assert, details as X } from '@agoric/assert';
import { Nat } from '@agoric/nat';

import {
  assertIssuerKeywords,
  makeRatio,
} from '../../contractSupport/index.js';
import { makeLendInvitation } from './lend.js';

/**
 * Add collateral of a particular brand and get a loan of another brand.
 * Collateral (also known as margin) must be greater than the loan value, at an
 * amount set by the Maintenance Margin Requirement (mmr) in the terms of the
 * contract. The loan does not have a distinct end time. Rather, if the value of
 * the collateral changes such that insufficient margin is provided, the
 * collateral is liquidated, and the loan is closed. At any time, the borrower
 * can add collateral or repay the loan with interest, closing the loan. The
 * borrower can set up their own margin calls by getting the `priceAuthority`
 * from the terms and calling `E(priceAuthority).quoteWhenLT(allCollateral, x)`
 * where x is the value of the collateral in the Loan brand at which they want a
 * reminder to addCollateral.
 *
 * Note that all collateral must be of the same brand and all of the loaned
 * amount and interest must be of the same (separate) brand.
 *
 * Terms:
 *
 * - Mmr (default = 150/100) - the Maintenance Margin Requirement, as a ratio. The
 *   default is 150/100, meaning that collateral should be worth at least 150%
 *   of the loan. If the value of the collateral drops below mmr, liquidation occurs.
 * - PriceAuthority - will be used for getting the current value of collateral and
 *   setting liquidation triggers.
 * - AutoswapInstance - The running contract instance for an Autoswap or constant
 *   product AMM installation. The publicFacet of the instance is used for
 *   producing an invitation to sell the collateral on liquidation.
 * - PeriodNotifier - the Notifier that provides notifications that periods have
 *   passed, on which compound interest will be calculated using the
 *   interestRate. Notifiers don't guarantee that clients will see all the
 *   changes, so the contract must track when interest last accrued.
 * - InterestRate - the rate in basis points that will be multiplied with the debt
 *   on every period to compound interest.
 * - InterestPeriod - the period at which interest compounds.
 *
 * IssuerKeywordRecord:
 *
 * - Keyword: 'Collateral' - The issuer for the digital assets to be escrowed as collateral.
 * - Keyword: 'Loan' - The issuer for the digital assets to be loaned out.
 *
 * @param {ZCF<{
 *   mmr: Ratio;
 *   autoswapInstance: Instance;
 *   priceAuthority: PriceAuthority;
 *   periodNotifier: PeriodNotifier;
 *   interestRate: Ratio;
 *   interestPeriod: bigint;
 * }>} zcf
 */
const start = async zcf => {
  assertIssuerKeywords(zcf, harden(['Collateral', 'Loan']));

  // Rather than grabbing the terms each time we use them, let's set
  // some defaults and add them to a contract-wide config.

  const {
    autoswapInstance,
    priceAuthority,
    periodNotifier,
    interestRate,
    interestPeriod,
    brands: { Loan: loanBrand, Collateral: collateralBrand },
    mmr = makeRatio(150n, loanBrand), // Maintenance Margin Requirement
  } = zcf.getTerms();

  assert(autoswapInstance, X`autoswapInstance must be provided`);
  assert(priceAuthority, X`priceAuthority must be provided`);
  assert(periodNotifier, X`periodNotifier must be provided`);
  Nat(interestPeriod);

  /** @type {LoanTerms} */
  const config = {
    mmr,
    autoswapInstance,
    priceAuthority,
    periodNotifier,
    interestRate,
    interestPeriod,
    loanBrand,
    collateralBrand,
  };

  const creatorInvitation = makeLendInvitation(zcf, harden(config));

  return { creatorInvitation };
};

harden(start);
export { start };
