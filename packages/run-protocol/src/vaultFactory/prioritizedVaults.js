// @ts-check

import {
  natSafeMath,
  makeRatioFromAmounts,
} from '@agoric/zoe/src/contractSupport/index.js';
import { assert } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { makeOrderedVaultStore } from './orderedVaultStore.js';
import { toVaultKey } from './storeUtils.js';

const { multiply, isGTE } = natSafeMath;

/** @typedef {import('./vault').InnerVault} VaultKit */

// TODO put this with other ratio math
/**
 *
 * @param {Ratio} left
 * @param {Ratio} right
 * @returns {boolean}
 */
const ratioGTE = (left, right) => {
  assert(
    left.numerator.brand === right.numerator.brand &&
      left.denominator.brand === right.denominator.brand,
    `brands must match`,
  );
  return isGTE(
    multiply(left.numerator.value, right.denominator.value),
    multiply(right.numerator.value, left.denominator.value),
  );
};

/**
 *
 * @param {Amount} debtAmount
 * @param {Amount} collateralAmount
 * @returns {Ratio}
 */
const calculateDebtToCollateral = (debtAmount, collateralAmount) => {
  if (AmountMath.isEmpty(collateralAmount)) {
    return makeRatioFromAmounts(
      debtAmount,
      AmountMath.make(collateralAmount.brand, 1n),
    );
  }
  return makeRatioFromAmounts(debtAmount, collateralAmount);
};

/**
 *
 * @param {Vault} vault
 * @returns {Ratio}
 */
export const currentDebtToCollateral = vault =>
  calculateDebtToCollateral(vault.getDebtAmount(), vault.getCollateralAmount());

/** @typedef {{debtToCollateral: Ratio, vaultKit: VaultKit}} VaultKitRecord */

/**
 * Really a prioritization of vault *kits*.
 *
 * @param {() => void} reschedulePriceCheck called when there is a new
 * least-collateralized vault
 */
export const makePrioritizedVaults = reschedulePriceCheck => {
  const vaults = makeOrderedVaultStore();

  // To deal with fluctuating prices and varying collateralization, we schedule a
  // new request to the priceAuthority when some vault's debtToCollateral ratio
  // surpasses the current high-water mark. When the request that is at the
  // current high-water mark fires, we reschedule at the new highest ratio
  // (which should be lower, as we will have liquidated any that were at least
  // as high.)
  // Without this we'd be calling reschedulePriceCheck() unnecessarily
  /** @type {Ratio=} */
  let oracleQueryThreshold;

  // Check if this ratio of debt to collateral would be the highest known. If
  // so, reset our highest and invoke the callback. This can be called on new
  // vaults and when we get a state update for a vault changing balances.
  /** @param {Ratio} collateralToDebt */

  // Caches and reschedules
  const rescheduleIfHighest = collateralToDebt => {
    if (
      !oracleQueryThreshold ||
      !ratioGTE(oracleQueryThreshold, collateralToDebt)
    ) {
      oracleQueryThreshold = collateralToDebt;
      reschedulePriceCheck();
    }
  };

  /**
   *
   * @returns {Ratio=} actual debt over collateral
   */
  const firstDebtRatio = () => {
    if (vaults.getSize() === 0) {
      return undefined;
    }

    const [[_, vaultKit]] = vaults.entries();
    const { vault } = vaultKit;
    const collateralAmount = vault.getCollateralAmount();
    if (AmountMath.isEmpty(collateralAmount)) {
      // Would be an infinite ratio
      return undefined;
    }
    const actualDebtAmount = vault.getDebtAmount();
    return makeRatioFromAmounts(actualDebtAmount, vault.getCollateralAmount());
  };

  /**
   * @param {string} key
   * @returns {VaultKit}
   */
  const removeVault = key => {
    const vk = vaults.removeByKey(key);
    const debtToCollateral = currentDebtToCollateral(vk.vault);
    if (
      !oracleQueryThreshold ||
      // TODO check for equality is sufficient and faster
      ratioGTE(debtToCollateral, oracleQueryThreshold)
    ) {
      // don't call reschedulePriceCheck, but do reset the highest.
      oracleQueryThreshold = firstDebtRatio();
    }
    return vk;
  };

  /**
   *
   * @param {Amount} oldDebt
   * @param {Amount} oldCollateral
   * @param {string} vaultId
   */
  const removeVaultByAttributes = (oldDebt, oldCollateral, vaultId) => {
    const key = toVaultKey(oldDebt, oldCollateral, vaultId);
    return removeVault(key);
  };

  /**
   *
   * @param {VaultId} vaultId
   * @param {VaultKit} vaultKit
   */
  const addVaultKit = (vaultId, vaultKit) => {
    vaults.addVaultKit(vaultId, vaultKit);

    const debtToCollateral = currentDebtToCollateral(vaultKit.vault);
    rescheduleIfHighest(debtToCollateral);
  };

  /**
   * Invoke a function for vaults with debt to collateral at or above the ratio.
   *
   * Results are returned in order of priority, with highest debt to collateral first.
   *
   * Redundant tags until https://github.com/Microsoft/TypeScript/issues/23857
   *
   * @param {Ratio} ratio
   * @yields {[string, VaultKit]>}
   * @returns {IterableIterator<[string, VaultKit]>}
   */
  // eslint-disable-next-line func-names
  function* entriesPrioritizedGTE(ratio) {
    // TODO use a Pattern to limit the query
    for (const [key, vk] of vaults.entries()) {
      const debtToCollateral = currentDebtToCollateral(vk.vault);
      if (ratioGTE(debtToCollateral, ratio)) {
        yield [key, vk];
      } else {
        // stop once we are below the target ratio
        break;
      }
    }
  }

  /**
   * @param {Amount} oldDebt
   * @param {Amount} oldCollateral
   * @param {string} vaultId
   */
  const refreshVaultPriority = (oldDebt, oldCollateral, vaultId) => {
    const vaultKit = removeVaultByAttributes(oldDebt, oldCollateral, vaultId);
    addVaultKit(vaultId, vaultKit);
  };

  return harden({
    addVaultKit,
    entries: vaults.entries,
    entriesPrioritizedGTE,
    highestRatio: () => oracleQueryThreshold,
    refreshVaultPriority,
    removeVault,
    removeVaultByAttributes,
  });
};
