import { AmountMath } from '@agoric/ertp';
import {
  ceilDivideBy,
  ceilMultiplyBy,
  floorMultiplyBy,
  makeRatioFromAmounts,
  multiplyRatios,
} from '@agoric/zoe/src/contractSupport/index.js';
import { quoteAsRatio, subtractToEmpty } from '../contractSupport.js';
import { liquidationResults } from './liquidation.js';

/** @import {PriceDescription} from '@agoric/zoe'; */

/**
 * @typedef {{
 *   overage: Amount<'nat'>;
 *   shortfallToReserve: Amount<'nat'>;
 *   collateralForReserve: Amount<'nat'>;
 *   actualCollateralSold: Amount<'nat'>;
 *   collateralSold: Amount<'nat'>;
 *   collatRemaining: Amount<'nat'>;
 *   debtToBurn: Amount<'nat'>;
 *   mintedForReserve: Amount<'nat'>;
 *   mintedProceeds: Amount<'nat'>;
 *   phantomDebt: Amount<'nat'>;
 *   totalPenalty: Amount<'nat'>;
 *   transfersToVault: [number, AmountKeywordRecord][];
 *   vaultsToReinstate: number[];
 * }} DistributionPlan
 *   The plan to execute for distributing proceeds of a liquidation.
 *
 *   Vaults are referenced by index in the list sent to the calculator.
 */

/**
 * @typedef {{
 *   collateral: Amount<'nat'>;
 *   presaleDebt: Amount<'nat'>;
 *   currentDebt: Amount<'nat'>;
 * }} VaultBalances
 */

/**
 * Liquidation.md describes how to process liquidation proceeds.
 *
 * This function is complex and may fail. To defend against this possibility, it
 * starts with a base plan and updates it. The updating is the complex portion
 * and is wrapped in a try/catch. If at any point the plan revising fails, the
 * plan is returned as is.
 *
 * @param {object} inputs
 * @param {AmountKeywordRecord} inputs.proceeds
 * @param {Amount<'nat'>} inputs.totalDebt
 * @param {Amount<'nat'>} inputs.totalCollateral
 * @param {PriceDescription} inputs.oraclePriceAtStart
 * @param {VaultBalances[]} inputs.vaultsBalances ordered best to worst
 *   collateralized
 * @param {Ratio} inputs.penaltyRate
 * @returns {DistributionPlan}
 */
export const calculateDistributionPlan = ({
  proceeds,
  totalDebt,
  totalCollateral,
  oraclePriceAtStart,
  vaultsBalances,
  penaltyRate,
}) => {
  const emptyCollateral = AmountMath.makeEmptyFromAmount(totalCollateral);
  const emptyMinted = AmountMath.makeEmptyFromAmount(totalDebt);

  const { Collateral: collateralProceeds } = proceeds;
  /** @type {Amount<'nat'>} */
  const collateralSold = AmountMath.subtract(
    totalCollateral,
    collateralProceeds,
  );

  const mintedProceeds = proceeds.Minted || emptyMinted;
  const accounting = liquidationResults(totalDebt, mintedProceeds);

  // charged in collateral
  const totalPenalty = ceilMultiplyBy(
    totalDebt,
    multiplyRatios(penaltyRate, quoteAsRatio(oraclePriceAtStart)),
  );

  const debtPortion = makeRatioFromAmounts(totalPenalty, totalDebt);

  // We mutate the plan so that at any point if there's an error the plan can be returned and executed.
  // IOW the plan must always be in a valid state, though perhaps incomplete.
  /** @type {DistributionPlan} */
  const plan = {
    overage: accounting.overage,
    shortfallToReserve: accounting.shortfall,
    collateralForReserve: emptyCollateral,
    actualCollateralSold: emptyCollateral,
    collateralSold,
    collatRemaining: emptyCollateral,
    debtToBurn: emptyMinted,
    mintedForReserve: emptyMinted,
    mintedProceeds,
    phantomDebt: emptyMinted,
    transfersToVault: [],
    vaultsToReinstate: [],
    totalPenalty,
  };

  /**
   * If interest was charged between liquidating and liquidated, erase it.
   *
   * @param {VaultBalances} balances
   */
  const updatePhantomDebt = ({ presaleDebt, currentDebt }) => {
    if (AmountMath.isEqual(presaleDebt, currentDebt)) {
      return;
    }
    const accrued = AmountMath.subtract(currentDebt, presaleDebt);
    plan.phantomDebt = AmountMath.add(plan.phantomDebt, accrued);
  };

  const runFlow1 = () => {
    // Flow #1: no shortfall

    const distributableCollateral = subtractToEmpty(
      collateralProceeds,
      totalPenalty,
    );

    plan.debtToBurn = totalDebt;
    plan.mintedForReserve = accounting.overage;

    // return remaining funds to vaults before closing

    let leftToStage = distributableCollateral;
    const price = makeRatioFromAmounts(mintedProceeds, collateralSold);

    // iterate from best to worst, returning collateral until it has
    // been exhausted. Vaults after that get nothing.
    for (const [vaultIndex, balances] of vaultsBalances.entries()) {
      const { collateral: vCollat, presaleDebt } = balances;
      updatePhantomDebt(balances);

      // max return is vault value reduced by debt and penalty value
      const debtCollat = ceilDivideBy(presaleDebt, price);
      const penaltyCollat = ceilMultiplyBy(presaleDebt, debtPortion);
      const lessCollat = AmountMath.add(debtCollat, penaltyCollat);

      const maxCollat = subtractToEmpty(vCollat, lessCollat);
      if (!AmountMath.isEmpty(leftToStage)) {
        const collatReturn = AmountMath.min(leftToStage, maxCollat);
        leftToStage = AmountMath.subtract(leftToStage, collatReturn);
        plan.transfersToVault.push([vaultIndex, { Collateral: collatReturn }]);
      }
    }

    const hasCollateralToDistribute = !AmountMath.isEmpty(
      distributableCollateral,
    );
    plan.collateralForReserve = hasCollateralToDistribute
      ? AmountMath.add(leftToStage, totalPenalty)
      : collateralProceeds;
  };

  // Flow 2a: all collateral was sold but debt was not covered
  const runFlow2a = () => {
    // charge penalty if proceeds are sufficient
    const penaltyInMinted = ceilMultiplyBy(totalDebt, penaltyRate);
    const recoveredDebt = AmountMath.min(
      AmountMath.add(totalDebt, penaltyInMinted),
      mintedProceeds,
    );

    plan.debtToBurn = recoveredDebt;

    const distributable = subtractToEmpty(mintedProceeds, recoveredDebt);
    let mintedRemaining = distributable;

    const vaultPortion = makeRatioFromAmounts(distributable, totalCollateral);

    // iterate from best to worst returning remaining funds to vaults
    for (const [vaultIndex, balances] of vaultsBalances.entries()) {
      // from best to worst, return minted above penalty if any remains
      const vaultShare = floorMultiplyBy(balances.collateral, vaultPortion);
      updatePhantomDebt(balances);

      if (!AmountMath.isEmpty(mintedRemaining)) {
        const mintedToReturn = AmountMath.min(mintedRemaining, vaultShare);
        mintedRemaining = AmountMath.subtract(mintedRemaining, mintedToReturn);
        plan.transfersToVault.push([vaultIndex, { Minted: mintedToReturn }]);
      }
    }
  };

  // Flow 2b: collateral remains but debt was not covered
  const runFlow2b = () => {
    plan.debtToBurn = totalDebt;
    plan.mintedForReserve = accounting.overage;

    // reconstitute vaults until collateral is insufficient
    let reconstituteVaults = AmountMath.isGTE(collateralProceeds, totalPenalty);

    // charge penalty if proceeds are sufficient
    const distributableCollateral = subtractToEmpty(
      collateralProceeds,
      totalPenalty,
    );

    plan.collatRemaining = distributableCollateral;

    let shortfallToReserve = accounting.shortfall;
    const reduceCollateral = amount =>
      (plan.actualCollateralSold = AmountMath.add(
        plan.actualCollateralSold,
        amount,
      ));

    // iterate from best to worst attempting to reconstitute, by
    // returning remaining funds to vaults
    for (const [vaultIndex, balances] of vaultsBalances.entries()) {
      const { collateral: vCollat, presaleDebt } = balances;

      // according to #7123, Collateral for penalty =
      //   total liquidation penalty * vault debt / total debt
      const vaultPenalty = ceilMultiplyBy(presaleDebt, debtPortion);
      const collatPostPenalty = subtractToEmpty(vCollat, vaultPenalty);
      const vaultDebt = floorMultiplyBy(presaleDebt, debtPortion);

      // Should we continue reconstituting vaults?
      reconstituteVaults =
        reconstituteVaults &&
        !AmountMath.isEmpty(collatPostPenalty) &&
        AmountMath.isGTE(plan.collatRemaining, collatPostPenalty) &&
        AmountMath.isGTE(totalDebt, presaleDebt);

      if (reconstituteVaults) {
        plan.collatRemaining = AmountMath.subtract(
          plan.collatRemaining,
          collatPostPenalty,
        );
        shortfallToReserve = subtractToEmpty(shortfallToReserve, presaleDebt);
        // must reinstate after atomicRearrange(), so we record them.
        plan.vaultsToReinstate.push(vaultIndex);
        reduceCollateral(vaultDebt);
        plan.transfersToVault.push([
          vaultIndex,
          { Collateral: collatPostPenalty },
        ]);
      } else {
        updatePhantomDebt(balances);

        reduceCollateral(vCollat);
      }
    }

    plan.collateralForReserve = AmountMath.add(
      plan.collatRemaining,
      totalPenalty,
    );

    plan.shortfallToReserve = shortfallToReserve;
  };

  try {
    if (AmountMath.isEmpty(accounting.shortfall)) {
      // Flow #1: no shortfall
      runFlow1();
    } else if (AmountMath.isEmpty(collateralProceeds)) {
      // Flow 2a: all collateral was sold but debt was not covered
      runFlow2a();
    } else {
      // Flow #2b: There's unsold collateral; some vaults may be reinstated.
      runFlow2b();
    }
  } catch (err) {
    console.error('🚨 Failure running distribution flow:', err);
    // continue to return `plan` in the state that was reached
  }

  return harden(plan);
};
harden(calculateDistributionPlan);
