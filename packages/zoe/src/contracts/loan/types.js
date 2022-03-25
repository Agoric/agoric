/**
 * @typedef {Notifier<Timestamp>} PeriodNotifier The Notifier that provides
 *   notifications that periods have passed. Since notifiers can't be relied on
 *   to produce an output every time they should, we'll track the time of last
 *   payment, and catch up if any times have been missed. Compound interest will
 *   be calculated using the interestRate.
 */

/**
 * @typedef {Instance} AutoswapInstance The running contract instance for an
 *   Autoswap or constant product AMM installation. The publicFacet from the
 *   Autoswap instance is used for producing an invitation to sell the
 *   collateral on liquidation.
 */

/**
 * @typedef LoanTerms
 * @property {Ratio} mmr - Maintenance Margin Requirement, a Ratio record. Default is 150%
 * @property {AutoswapInstance} autoswapInstance
 * @property {PriceAuthority} priceAuthority Used for getting the current value
 *   of collateral and setting liquidation triggers.
 * @property {PeriodNotifier} periodNotifier
 * @property {Ratio} interestRate The rate in basis points that will be
 *   multiplied with the debt on every period to compound interest.
 * @property {RelativeTime} interestPeriod
 * @property {Brand} loanBrand
 * @property {Brand} collateralBrand
 */

/**
 * @typedef LenderSeatProperty
 * @property {ZCFSeat} lenderSeat The ZCFSeat representing the lender's position
 *   in the contract.
 */

/**
 * @typedef {LoanTerms & LenderSeatProperty} LoanConfigWithLender The loan now
 *   has a lenderSeat, which is added to the config.
 */

/**
 * @typedef BorrowerConfigProperties
 * @property {ZCFSeat} collateralSeat The ZCFSeat holding the collateral in
 *   escrow after the borrower escrows it
 * @property {() => Amount} getDebt A function to get the current debt
 * @property {PromiseRecord<PriceQuote>} liquidationPromiseKit PromiseKit that
 *   includes a promise that resolves to a PriceQuote when liquidation is triggered
 */

/**
 * @typedef BorrowerConfigPropertiesMinusDebt
 * @property {ZCFSeat} collateralSeat The ZCFSeat holding the collateral in
 *   escrow after the borrower escrows it
 * @property {PromiseRecord<PriceQuote>} liquidationPromiseKit PromiseKit that
 *   includes a promise that resolves to a PriceQuote when liquidation is triggered
 */

/**
 * @typedef {LoanConfigWithLender & BorrowerConfigProperties} LoanConfigWithBorrower
 *   The loan has a lender, a borrower, and collateral escrowed.
 */

/** @typedef {LoanConfigWithLender & BorrowerConfigPropertiesMinusDebt} LoanConfigWithBorrowerMinusDebt */

/**
 * @callback ScheduleLiquidation
 * @param {ZCF} zcf
 * @param {LoanConfigWithBorrower} config
 */

/**
 * @callback MakeLendInvitation
 * @param {ZCF} zcf
 * @param {LoanTerms} config
 * @returns {Promise<Invitation>} LendInvitation
 */

/**
 * @callback MakeBorrowInvitation
 * @param {ZCF} zcf
 * @param {LoanConfigWithLender} config
 * @returns {Promise<Invitation>} BorrowInvitation
 */

/**
 * @callback MakeCloseLoanInvitation
 * @param {ZCF} zcf
 * @param {LoanConfigWithBorrower} config
 * @returns {Promise<Invitation>} CloseLoanInvitation
 */

/**
 * Allows holder to add collateral to the contract. Exits the seat after adding.
 *
 * @callback MakeAddCollateralInvitation
 * @param {ZCF} zcf
 * @param {LoanConfigWithBorrower} config
 * @returns {Promise<Invitation>} AddCollateralInvitation
 */

/**
 * @callback Liquidate
 * @param {ZCF} zcf
 * @param {LoanConfigWithBorrower} config
 * @returns {void}
 */

/**
 * @callback MakeDebtCalculator
 * @param {DebtCalculatorConfig} debtCalculatorConfig
 */

/**
 * @callback CalcInterestFn
 * @param {Amount} oldDebt
 * @param {Ratio} interestRate
 * @returns {Amount} Interest
 */

/**
 * @typedef {Object} DebtCalculatorConfig
 * @property {CalcInterestFn} calcInterestFn A function to calculate the
 *   interest, given the debt value and an interest rate in basis points.
 * @property {Amount} originalDebt The debt at the start of the loan, in Loan brand
 * @property {PeriodNotifier} periodNotifier The AsyncIterable to notify when a
 *   period has occurred
 * @property {Ratio} interestRate
 * @property {RelativeTime} interestPeriod The period at which the outstanding
 *   debt increases by the interestRate
 * @property {ZCF} zcf
 * @property {LoanConfigWithBorrowerMinusDebt} configMinusGetDebt
 * @property {Timestamp} basetime The starting point from which to calculate interest.
 */

/**
 * @typedef {Object} ConfigMinusGetDebt
 * @property {ZCFSeat} collateralSeat
 * @property {PromiseRecord<any>} liquidationPromiseKit
 * @property {bigint} [mmr]
 * @property {Handle<'Instance'>} autoswapInstance
 * @property {PriceAuthority} priceAuthority
 * @property {PeriodNotifier} periodNotifier
 * @property {bigint} interestRate
 * @property {RelativeTime} interestPeriod
 * @property {ZCFSeat} lenderSeat
 */

/**
 * @typedef {Object} BorrowFacet
 * @property {() => Promise<Invitation>} makeCloseLoanInvitation Make an
 *   invitation to close the loan by repaying the debt (including interest).
 * @property {() => Promise<Invitation>} makeAddCollateralInvitation Make an
 *   invitation to add collateral to protect against liquidation
 * @property {() => Promise<PriceQuote>} getLiquidationPromise Get a promise for
 *   a priceQuote that will resolve if liquidation occurs. The priceQuote is for
 *   the value of the collateral that triggered the liquidation. This may be
 *   lower than expected if the price is moving quickly.
 * @property {() => Timestamp} getLastCalculationTimestamp Get the timestamp at
 *   which the debt was most recently recalculated.
 * @property {() => Notifier<Amount>} getDebtNotifier Get a Notifier that will
 *   be updated when the current debt (an Amount with the Loan Brand) changes.
 *   This will increase as interest is added.
 * @property {() => Amount} getRecentCollateralAmount Get a recent report of the
 *   amount of collateral in the loan
 */
