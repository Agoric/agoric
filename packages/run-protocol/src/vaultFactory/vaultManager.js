// @ts-check

import '@agoric/zoe/exported.js';

import { E } from '@endo/eventual-send';
import { Nat } from '@agoric/nat';
import {
  assertProposalShape,
  makeRatioFromAmounts,
  getAmountOut,
  getAmountIn,
  ceilMultiplyBy,
  ceilDivideBy,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeNotifierKit, observeNotifier } from '@agoric/notifier';
import { AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';

import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeInnerVault } from './vault.js';
import { makePrioritizedVaults } from './prioritizedVaults.js';
import { liquidate } from './liquidation.js';
import { makeTracer } from '../makeTracer.js';
import { RECORDING_PERIOD_KEY, CHARGING_PERIOD_KEY } from './params.js';
import { chargeInterest } from '../interest.js';

const { details: X } = assert;

const trace = makeTracer('VM');

/**
 * @typedef {{
 *   compoundedInterest: Ratio;
 *   interestRate: Ratio;
 *   latestInterestUpdate: bigint;
 *   totalDebt: Amount<'nat'>;
 * }} AssetState
 */

/**
 * Each VaultManager manages a single collateral type.
 *
 * It manages some number of outstanding loans, each called a Vault, for which
 * the collateral is provided in exchange for borrowed RUN.
 *
 * @param {ZCF} zcf
 * @param {ZCFMint<'nat'>} debtMint
 * @param {Brand} collateralBrand
 * @param {ERef<PriceAuthority>} priceAuthority
 * @param {{
 *   ChargingPeriod: ParamRecord<'nat'>;
 *   RecordingPeriod: ParamRecord<'nat'>;
 * }} timingParams
 * @param {{
 *   getInterestRate: () => Ratio;
 *   getLiquidationMargin: () => Ratio;
 *   getLoanFee: () => Ratio;
 * }} loanParamGetters
 * @param {ReallocateWithFee} reallocateWithFee
 * @param {ERef<TimerService>} timerService
 * @param {LiquidationStrategy} liquidationStrategy
 * @param {Timestamp} startTimeStamp
 * @returns {VaultManager}
 */
export const makeVaultManager = (
  zcf,
  debtMint,
  collateralBrand,
  priceAuthority,
  timingParams,
  loanParamGetters,
  reallocateWithFee,
  timerService,
  liquidationStrategy,
  startTimeStamp,
) => {
  /** @type {{ brand: Brand<'nat'> }} */
  const { brand: debtBrand } = debtMint.getIssuerRecord();

  /** @type {GetVaultParams} */
  const shared = {
    ...loanParamGetters,
    getChargingPeriod: () => timingParams[CHARGING_PERIOD_KEY].value,
    getRecordingPeriod: () => timingParams[RECORDING_PERIOD_KEY].value,
    async getCollateralQuote() {
      // get a quote for one unit of the collateral
      const displayInfo = await E(collateralBrand).getDisplayInfo();
      const decimalPlaces = displayInfo?.decimalPlaces || 0n;
      return E(priceAuthority).quoteGiven(
        AmountMath.make(collateralBrand, 10n ** Nat(decimalPlaces)),
        debtBrand,
      );
    },
  };

  let vaultCounter = 0;

  /**
   * A store for vaultKits prioritized by their collaterization ratio.
   *
   * It should be set only once but it's a `let` because it can't be set until
   * after the definition of reschedulePriceCheck, which refers to sortedVaultKits
   *
   * @type {ReturnType<typeof makePrioritizedVaults>}
   */
  // XXX misleading mutability and confusing flow control; could be refactored with a listener
  let prioritizedVaults;

  // Progress towards durability https://github.com/Agoric/agoric-sdk/issues/4568#issuecomment-1042346271
  /** @type {MapStore<string, InnerVault>} */
  const vaultsToLiquidate = makeScalarBigMapStore('vaultsToLiquidate');

  /** @type {MutableQuote} */
  let outstandingQuote;
  /** @type {Amount<'nat'>} */
  let totalDebt = AmountMath.makeEmpty(debtBrand, 'nat');
  /** @type {Ratio} } */
  let compoundedInterest = makeRatio(100n, debtBrand); // starts at 1.0, no interest

  /**
   * Timestamp of most recent update to interest
   *
   * @type {bigint}
   */
  let latestInterestUpdate = startTimeStamp;

  const { updater: assetUpdater, notifier: assetNotifer } = makeNotifierKit(
    harden({
      compoundedInterest,
      interestRate: shared.getInterestRate(),
      latestInterestUpdate,
      totalDebt,
    }),
  );

  /** @param {Iterable<[key: string, vaultKit: InnerVault]>} vaultEntries */
  const enqueueToLiquidate = vaultEntries => {
    assert(prioritizedVaults);
    for (const [k, v] of vaultEntries) {
      vaultsToLiquidate.init(k, v);
      prioritizedVaults.removeVault(k);
    }
  };

  const executeLiquidation = async () => {
    // Start all promises in parallel
    // XXX we should have a direct method to map over entries
    const liquidations = Array.from(vaultsToLiquidate.entries()).map(
      async ([key, vault]) => {
        trace('liquidating', vault.getVaultSeat().getProposal());
        try {
          // Start liquidation (vaultState: LIQUIDATING)
          await liquidate(
            zcf,
            vault,
            debtMint.burnLosses,
            liquidationStrategy,
            collateralBrand,
          );
          vaultsToLiquidate.delete(key);
        } catch (e) {
          // XXX should notify interested parties
          console.error('liquidateAndRemove failed with', e);
        }
      },
    );
    return Promise.all(liquidations);
  };

  // When any Vault's debt ratio is higher than the current high-water level,
  // call reschedulePriceCheck() to request a fresh notification from the
  // priceAuthority. There will be extra outstanding requests since we can't
  // cancel them. (https://github.com/Agoric/agoric-sdk/issues/2713). When the
  // vault with the current highest debt ratio is removed or reduces its ratio,
  // we won't reschedule the priceAuthority requests to reduce churn. Instead,
  // when a priceQuote is received, we'll only reschedule if the high-water
  // level when the request was made matches the current high-water level.
  const reschedulePriceCheck = async () => {
    assert(prioritizedVaults);
    const highestDebtRatio = prioritizedVaults.highestRatio();
    if (!highestDebtRatio) {
      // if there aren't any open vaults, we don't need an outstanding RFQ.
      return;
    }

    const liquidationMargin = shared.getLiquidationMargin();

    // ask to be alerted when the price level falls enough that the vault
    // with the highest debt to collateral ratio will no longer be valued at the
    // liquidationMargin above its debt.
    const triggerPoint = ceilMultiplyBy(
      highestDebtRatio.numerator, // debt
      liquidationMargin,
    );

    // if there's an outstanding quote, reset the level. If there's no current
    // quote (because this is the first loan, or because a quote just resolved)
    // then make a new request to the priceAuthority, and when it resolves,
    // liquidate anything that's above the price level.
    if (outstandingQuote) {
      // Safe to call extraneously (lightweight and idempotent)
      E(outstandingQuote).updateLevel(
        highestDebtRatio.denominator, // collateral
        triggerPoint,
      );
      return;
    }

    outstandingQuote = await E(priceAuthority).mutableQuoteWhenLT(
      highestDebtRatio.denominator, // collateral
      triggerPoint,
    );

    // There are two awaits in a row here. The first gets a mutableQuote object
    // relatively quickly from the PriceAuthority. The second schedules a
    // callback that may not fire until much later.
    // Callers shouldn't expect a response from this function.
    const quote = await E(outstandingQuote).getPromise();
    // When we receive a quote, we liquidate all the vaults that don't have
    // sufficient collateral, (even if the trigger was set for a different
    // level) because we use the actual price ratio plus margin here. Use
    // ceilDivide to round up because ratios above this will be liquidated.
    const quoteRatioPlusMargin = makeRatioFromAmounts(
      ceilDivideBy(getAmountOut(quote), liquidationMargin),
      getAmountIn(quote),
    );

    enqueueToLiquidate(
      prioritizedVaults.entriesPrioritizedGTE(quoteRatioPlusMargin),
    );

    outstandingQuote = undefined;
    // Ensure all vaults complete
    await executeLiquidation();

    reschedulePriceCheck();
  };
  prioritizedVaults = makePrioritizedVaults(reschedulePriceCheck);

  // In extreme situations, system health may require liquidating all vaults.
  const liquidateAll = async () => {
    assert(prioritizedVaults);
    enqueueToLiquidate(prioritizedVaults.entries());
    await executeLiquidation();
  };

  /**
   * @param {bigint} updateTime
   * @param {ZCFSeat} poolIncrementSeat
   */
  const chargeAllVaults = async (updateTime, poolIncrementSeat) => {
    trace('chargeAllVaults', { updateTime });
    const interestRate = shared.getInterestRate();

    // Update local state with the results of charging interest
    ({ compoundedInterest, latestInterestUpdate, totalDebt } = chargeInterest(
      {
        mint: debtMint,
        reallocateWithFee,
        poolIncrementSeat,
        seatAllocationKeyword: 'RUN',
      },
      {
        interestRate,
        chargingPeriod: shared.getChargingPeriod(),
        recordingPeriod: shared.getRecordingPeriod(),
      },
      { latestInterestUpdate, compoundedInterest, totalDebt },
      updateTime,
    ));

    /** @type {AssetState} */
    const payload = harden({
      compoundedInterest,
      interestRate,
      latestInterestUpdate,
      totalDebt,
    });
    assetUpdater.updateState(payload);

    trace('chargeAllVaults complete', payload);

    reschedulePriceCheck();
  };

  /**
   * Update total debt of this manager given the change in debt on a vault
   *
   * @param {Amount<'nat'>} oldDebtOnVault
   * @param {Amount<'nat'>} newDebtOnVault
   */
  // TODO https://github.com/Agoric/agoric-sdk/issues/4599
  const applyDebtDelta = (oldDebtOnVault, newDebtOnVault) => {
    // This does not use AmountMath because it could be validly negative
    const delta = newDebtOnVault.value - oldDebtOnVault.value;
    trace(`updating total debt ${totalDebt} by ${delta}`);
    if (delta === 0n) {
      // nothing to do
      return;
    }

    // totalDebt += delta (Amount type ensures natural value)
    totalDebt = AmountMath.make(debtBrand, totalDebt.value + delta);
  };

  /**
   * @param {Amount<'nat'>} oldDebt
   * @param {Amount<'nat'>} oldCollateral
   * @param {VaultId} vaultId
   */
  const updateVaultPriority = (oldDebt, oldCollateral, vaultId) => {
    assert(prioritizedVaults);
    prioritizedVaults.refreshVaultPriority(oldDebt, oldCollateral, vaultId);
    trace('updateVaultPriority complete', { totalDebt });
  };

  const periodNotifier = E(timerService).makeNotifier(
    0n,
    timingParams[RECORDING_PERIOD_KEY].value,
  );
  const { zcfSeat: poolIncrementSeat } = zcf.makeEmptySeatKit();

  const timeObserver = {
    updateState: updateTime =>
      chargeAllVaults(updateTime, poolIncrementSeat).catch(e =>
        console.error('🚨 vaultManager failed to charge interest', e),
      ),
    fail: reason => {
      zcf.shutdownWithFailure(
        assert.error(X`Unable to continue without a timer: ${reason}`),
      );
    },
    finish: done => {
      zcf.shutdownWithFailure(
        assert.error(X`Unable to continue without a timer: ${done}`),
      );
    },
  };

  observeNotifier(periodNotifier, timeObserver);

  /** @type {Parameters<typeof makeInnerVault>[1]} */
  const managerFacet = harden({
    ...shared,
    applyDebtDelta,
    reallocateWithFee,
    getCollateralBrand: () => collateralBrand,
    getCompoundedInterest: () => compoundedInterest,
    updateVaultPriority,
  });

  /** @param {ZCFSeat} seat */
  const makeVaultKit = async seat => {
    assertProposalShape(seat, {
      give: { Collateral: null },
      want: { RUN: null },
    });

    vaultCounter += 1;
    const vaultId = String(vaultCounter);

    const innerVault = makeInnerVault(
      zcf,
      managerFacet,
      assetNotifer,
      vaultId,
      debtMint,
      priceAuthority,
    );

    // TODO Don't record the vault until it gets opened
    assert(prioritizedVaults);
    const addedVaultKey = prioritizedVaults.addVault(vaultId, innerVault);

    try {
      // TODO `await` is allowed until the above ordering is fixed
      // eslint-disable-next-line @jessie.js/no-nested-await
      const vaultKit = await innerVault.initVaultKit(seat);
      seat.exit();
      return vaultKit;
    } catch (err) {
      // remove it from prioritizedVaults
      // XXX openLoan shouldn't assume it's already in the prioritizedVaults
      prioritizedVaults.removeVault(addedVaultKey);
      throw err;
    }
  };

  /** @type {VaultManager} */
  return Far('vault manager', {
    ...shared,
    makeVaultKit,
    liquidateAll,
  });
};
