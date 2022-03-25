// @ts-check

/** @typedef {import('./vault').VaultUIState} VaultUIState */
/** @typedef {import('./vaultKit').VaultKit} VaultKit */
/** @typedef {VaultKit['vault']} Vault */

/**
 * @typedef {Object} AutoswapLocal
 * @property {(amount: Amount, brand: Brand) => Amount} getInputPrice
 * @property {() => Invitation} makeSwapInvitation
 */

/**
 * @typedef {Object} Collateral
 * @property {Ratio} liquidationMargin
 * @property {Ratio} stabilityFee
 * @property {Ratio} marketPrice
 * @property {Ratio} interestRate
 * @property {Brand} brand
 */

/**
 * @typedef {Object} Rates
 * @property {Ratio} liquidationMargin - Margin below which collateral will be
 *   liquidated to satisfy the debt.
 * @property {Ratio} interestRate - Annual interest rate charged on loans
 * @property {Ratio} loanFee - The fee (in BasisPoints) charged when opening or
 *   increasing a loan.
 */

/**
 * @callback AddVaultType
 * @param {Issuer} collateralIssuer
 * @param {Keyword} collateralKeyword
 * @param {Rates} rates
 * @returns {Promise<VaultManager>}
 */

/**
 * @typedef {Object} VaultFactory - The creator facet
 * @property {AddVaultType} addVaultType
 * @property {() => Promise<Collateral[]>} getCollaterals
 * @property {() => Allocation} getRewardAllocation,
 * @property {() => Instance} getContractGovernor
 * @property {() => Promise<Invitation>} makeCollectFeesInvitation
 */

/**
 * @callback ReallocateWithFee Transfer the indicated amount to the
 *   vaultFactory's reward pool, taken from the `fromSeat`. Then reallocate over
 *   all the seat arguments and the rewardPoolSeat.
 * @param {Amount} amount
 * @param {ZCFSeat} fromSeat
 * @param {ZCFSeat} [otherSeat]
 * @returns {void}
 */

/**
 * @typedef {Object} GetVaultParams
 * @property {() => Ratio} getLiquidationMargin
 * @property {() => Ratio} getLoanFee
 * @property {() => Promise<PriceQuote>} getCollateralQuote
 * @property {() => Ratio} getInterestRate - The annual interest rate on a loan
 * @property {() => RelativeTime} getChargingPeriod - The period (in seconds) at
 *   which interest is charged to the loan.
 * @property {() => RelativeTime} getRecordingPeriod - The period (in seconds)
 *   at which interest is recorded to the loan.
 */

/** @typedef {string} VaultId */

/**
 * @typedef {Object} VaultManagerBase
 * @property {(seat: ZCFSeat) => Promise<VaultKit>} makeVaultKit
 * @property {() => void} liquidateAll
 */

/** @typedef {VaultManagerBase & GetVaultParams} VaultManager */

/**
 * @typedef {Object} LoanTiming
 * @property {RelativeTime} chargingPeriod
 * @property {RelativeTime} recordingPeriod
 */

/**
 * @typedef {Object} AMMFees
 * @property {bigint} poolFee
 * @property {bigint} protocolFee
 */

/**
 * @typedef {Object} LiquidationStrategy
 * @property {() => KeywordKeywordRecord} keywordMapping
 * @property {(collateral: Amount, run: Amount) => Proposal} makeProposal
 * @property {(runDebt: Amount) => Promise<Invitation>} makeInvitation
 */

/**
 * @typedef {Object} LiquidationCreatorFacet
 * @property {(runDebt: Amount) => Promise<Invitation>} makeDebtorInvitation
 */

/**
 * @callback MakeLiquidationStrategy
 * @param {LiquidationCreatorFacet} creatorFacet
 * @returns {LiquidationStrategy}
 */

/**
 * @typedef {Object} DebtStatus
 * @property {Timestamp} latestInterestUpdate
 * @property {NatValue} interest Interest accrued since latestInterestUpdate
 * @property {NatValue} newDebt Total including principal and interest
 */

/**
 * @callback Calculate
 * @param {DebtStatus} debtStatus
 * @param {Timestamp} currentTime
 * @returns {DebtStatus}
 */

/**
 * @typedef {Object} CalculatorKit
 * @property {Calculate} calculate Calculate new debt for charging periods up to
 *   the present.
 * @property {Calculate} calculateReportingPeriod Calculate new debt for
 *   reporting periods up to the present. If some charging periods have elapsed
 *   that don't constitute whole reporting periods, the time is not updated past
 *   them and interest is not accumulated for them.
 */

/** @typedef {import('./vault').InnerVault} InnerVault */
