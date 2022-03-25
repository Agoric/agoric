// @ts-check
import '@agoric/zoe/exported.js';

import { E } from '@endo/eventual-send';
import {
  assertProposalShape,
  getAmountOut,
  makeRatioFromAmounts,
  ceilMultiplyBy,
  floorMultiplyBy,
  floorDivideBy,
} from '@agoric/zoe/src/contractSupport/index.js';

import { assert } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';
import { makeTracer } from '../makeTracer.js';
import { calculateCurrentDebt, reverseInterest } from '../interest-math.js';
import { makeVaultKit } from './vaultKit.js';

const { details: X, quote: q } = assert;

const trace = makeTracer('IV');

/**
 * @file This Has most of the logic for a Vault, to borrow RUN against collateral.
 *
 *   The logic here is for InnerVault which is the majority of logic of vaults but
 *   the user view is the `vault` value contained in VaultKit.
 *
 *   A note on naming convention:
 *
 *   - `Pre` is used as a postfix for any mutable value retrieved _before_ an
 *       `await`, to flag values that must used very carefully after the `await`
 *   - `new` is a prefix for values that describe the result of executing a
 *       transaction; e.g., `debt` is the value before the txn, and `newDebt`
 *       will be value if the txn completes.
 *   - The absence of one of these implies the opposite, so `newDebt` is the future
 *       value fo `debt`, as computed based on values after any `await`
 */

/**
 * Constants for vault phase.
 *
 * ACTIVE - vault is in use and can be changed LIQUIDATING - vault is being
 * liquidated by the vault manager, and cannot be changed by the user TRANSFER -
 * vault is able to be transferred (payments and debits frozen until it has a
 * new owner) CLOSED - vault was closed by the user and all assets have been
 * paid out LIQUIDATED - vault was closed by the manager, with remaining assets
 * paid to owner
 */
export const VaultPhase = /** @type {const} */ ({
  ACTIVE: 'active',
  LIQUIDATING: 'liquidating',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  TRANSFER: 'transfer',
});

/**
 * @typedef {VaultPhase[keyof Omit<typeof VaultPhase, 'TRANSFER'>]} InnerPhase
 * @type {{ [K in InnerPhase]: InnerPhase[] }}
 */
const validTransitions = {
  [VaultPhase.ACTIVE]: [VaultPhase.LIQUIDATING, VaultPhase.CLOSED],
  [VaultPhase.LIQUIDATING]: [VaultPhase.LIQUIDATED],
  [VaultPhase.LIQUIDATED]: [VaultPhase.CLOSED],
  [VaultPhase.CLOSED]: [],
};

/**
 * @typedef {VaultPhase[keyof typeof VaultPhase]} OuterPhase
 *
 * @typedef {Object} VaultUIState
 * @property {Amount<'nat'>} locked Amount of Collateral locked
 * @property {{ run: Amount<'nat'>; interest: Ratio }} debtSnapshot Debt of
 *   'run' at the point the compounded interest was 'interest'
 * @property {Ratio} interestRate Annual interest rate charge
 * @property {Ratio} liquidationRatio
 * @property {OuterPhase} vaultState
 */

/**
 * @typedef {Object} InnerVaultManagerBase
 * @property {(oldDebt: Amount, newDebt: Amount) => void} applyDebtDelta
 * @property {() => Brand} getCollateralBrand
 * @property {ReallocateWithFee} reallocateWithFee
 * @property {() => Ratio} getCompoundedInterest - Coefficient on existing debt
 *   to calculate new debt
 * @property {(
 *   oldDebt: Amount,
 *   oldCollateral: Amount,
 *   vaultId: VaultId,
 * ) => void} updateVaultPriority
 */

/**
 * @typedef {Readonly<{
 *   assetNotifier: Notifier<import('./vaultManager').AssetState>;
 *   idInManager: VaultId;
 *   manager: InnerVaultManagerBase & GetVaultParams;
 *   priceAuthority: ERef<PriceAuthority>;
 *   mint: ZCFMint;
 *   vaultSeat: ZCFSeat;
 *   zcf: ZCF;
 * }>} ImmutableState
 */

/**
 * Snapshot is of the debt and compounded interest when the principal was last changed.
 *
 * @typedef {{
 *   interestSnapshot: Ratio;
 *   outerUpdater: IterationObserver<VaultUIState> | null;
 *   phase: InnerPhase;
 *   debtSnapshot: Amount<'nat'>;
 * }} MutableState
 */

/**
 * @param {ZCF} zcf
 * @param {InnerVaultManagerBase & GetVaultParams} manager
 * @param {Notifier<import('./vaultManager').AssetState>} assetNotifier
 * @param {VaultId} idInManager
 * @param {ZCFMint} mint
 * @param {ERef<PriceAuthority>} priceAuthority
 */
export const makeInnerVault = (
  zcf,
  manager,
  assetNotifier,
  idInManager,
  mint,
  priceAuthority,
) => {
  // CONSTANTS
  const collateralBrand = manager.getCollateralBrand();
  /** @type {{ brand: Brand<'nat'> }} */
  const { brand: debtBrand } = mint.getIssuerRecord();

  const emptyCollateral = AmountMath.makeEmpty(collateralBrand);
  const emptyDebt = AmountMath.makeEmpty(debtBrand);

  /**
   * State object to support virtualization when available
   *
   * @type {ImmutableState & MutableState}
   */
  const state = {
    assetNotifier,
    idInManager,
    manager,
    outerUpdater: null,
    phase: VaultPhase.ACTIVE,
    priceAuthority,
    mint,
    zcf,

    // vaultSeat will hold the collateral until the loan is retired. The
    // payout from it will be handed to the user: if the vault dies early
    // (because the vaultFactory vat died), they'll get all their
    // collateral back. If that happens, the issuer for the RUN will be dead,
    // so their loan will be worthless.
    vaultSeat: zcf.makeEmptySeatKit().zcfSeat,

    // Two values from the same moment
    interestSnapshot: manager.getCompoundedInterest(),
    debtSnapshot: emptyDebt,
  };

  // #region Phase logic
  /** @param {InnerPhase} newPhase */
  const assignPhase = newPhase => {
    const { phase } = state;
    const validNewPhases = validTransitions[phase];
    assert(
      validNewPhases.includes(newPhase),
      `Vault cannot transition from ${phase} to ${newPhase}`,
    );
    state.phase = newPhase;
  };

  const assertActive = () => {
    const { phase } = state;
    assert(phase === VaultPhase.ACTIVE);
  };

  const assertCloseable = () => {
    const { phase } = state;
    assert(
      phase === VaultPhase.ACTIVE || phase === VaultPhase.LIQUIDATED,
      X`to be closed a vault must be active or liquidated, not ${phase}`,
    );
  };
  // #endregion

  /**
   * Called whenever the debt is paid or created through a transaction, but not
   * for interest accrual.
   *
   * @param {Amount} newDebt - Principal and all accrued interest
   */
  const updateDebtSnapshot = newDebt => {
    // update local state
    state.debtSnapshot = newDebt;
    state.interestSnapshot = manager.getCompoundedInterest();
  };

  /**
   * Update the debt balance and propagate upwards to maintain aggregate debt
   * and liquidation order.
   *
   * @param {Amount} oldDebt - Prior principal and all accrued interest
   * @param {Amount} oldCollateral - Actual collateral
   * @param {Amount} newDebt - Actual principal and all accrued interest
   */
  const updateDebtAccounting = (oldDebt, oldCollateral, newDebt) => {
    updateDebtSnapshot(newDebt);
    // update vault manager which tracks total debt
    manager.applyDebtDelta(oldDebt, newDebt);
    // update position of this vault in liquidation priority queue
    manager.updateVaultPriority(oldDebt, oldCollateral, idInManager);
  };

  /**
   * The actual current debt, including accrued interest.
   *
   * This looks like a simple getter but it does a lot of the heavy lifting for
   * interest accrual. Rather than updating all records when interest accrues,
   * the vault manager updates just its rolling compounded interest. Here we
   * calculate what the current debt is given what's recorded in this vault and
   * what interest has compounded since this vault record was written.
   *
   * @returns {Amount<'nat'>}
   * @see getNormalizedDebt
   */
  const getCurrentDebt = () => {
    return calculateCurrentDebt(
      state.debtSnapshot,
      state.interestSnapshot,
      manager.getCompoundedInterest(),
    );
  };

  /**
   * The normalization puts all debts on a common time-independent scale since
   * the launch of this vault manager. This allows the manager to order vaults
   * by their debt-to-collateral ratios without having to mutate the debts as
   * the interest accrues.
   *
   * @returns {Amount<'nat'>} As if the vault was open at the launch of this
   *   manager, before any interest accrued
   * @see getActualDebAmount
   */
  const getNormalizedDebt = () => {
    return reverseInterest(state.debtSnapshot, state.interestSnapshot);
  };

  const getCollateralAllocated = seat =>
    seat.getAmountAllocated('Collateral', collateralBrand);
  const getRunAllocated = seat => seat.getAmountAllocated('RUN', debtBrand);

  const assertVaultHoldsNoRun = () => {
    const { vaultSeat } = state;
    assert(
      AmountMath.isEmpty(getRunAllocated(vaultSeat)),
      X`Vault should be empty of RUN`,
    );
  };

  const maxDebtFor = async collateralAmount => {
    const quoteAmount = await E(priceAuthority).quoteGiven(
      collateralAmount,
      debtBrand,
    );
    // floorDivide because we want the debt ceiling lower
    return floorDivideBy(
      getAmountOut(quoteAmount),
      manager.getLiquidationMargin(),
    );
  };

  const assertSufficientCollateral = async (
    collateralAmount,
    proposedRunDebt,
  ) => {
    const maxRun = await maxDebtFor(collateralAmount);
    assert(
      AmountMath.isGTE(maxRun, proposedRunDebt, debtBrand),
      X`Requested ${q(proposedRunDebt)} exceeds max ${q(maxRun)}`,
    );
  };

  /** @returns {Amount<'nat'>} */
  const getCollateralAmount = () => {
    const { vaultSeat } = state;
    // getCollateralAllocated would return final allocations
    return vaultSeat.hasExited()
      ? emptyCollateral
      : getCollateralAllocated(vaultSeat);
  };

  /** @param {OuterPhase} newPhase */
  const snapshotState = newPhase => {
    const { debtSnapshot: run, interestSnapshot: interest } = state;
    /** @type {VaultUIState} */
    return harden({
      // TODO move manager state to a separate notifer https://github.com/Agoric/agoric-sdk/issues/4540
      interestRate: manager.getInterestRate(),
      liquidationRatio: manager.getLiquidationMargin(),
      // XXX 'run' is implied by the brand in the amount
      debtSnapshot: { run, interest },
      locked: getCollateralAmount(),
      // newPhase param is so that makeTransferInvitation can finish without setting the vault's phase
      // TODO refactor https://github.com/Agoric/agoric-sdk/issues/4415
      vaultState: newPhase,
    });
  };

  // call this whenever anything changes!
  const updateUiState = () => {
    const { outerUpdater } = state;
    if (!outerUpdater) {
      console.warn('updateUiState called after outerUpdater removed');
      return;
    }
    const { phase } = state;
    const uiState = snapshotState(phase);
    trace('updateUiState', uiState);

    switch (phase) {
      case VaultPhase.ACTIVE:
      case VaultPhase.LIQUIDATING:
        outerUpdater.updateState(uiState);
        break;
      case VaultPhase.CLOSED:
      case VaultPhase.LIQUIDATED:
        outerUpdater.finish(uiState);
        state.outerUpdater = null;
        break;
      default:
        throw Error(`unreachable vault phase: ${phase}`);
    }
  };

  /**
   * Call must check for and remember shortfall
   *
   * @param {Amount} newDebt
   */
  const liquidated = newDebt => {
    updateDebtSnapshot(newDebt);

    assignPhase(VaultPhase.LIQUIDATED);
    updateUiState();
  };

  const liquidating = () => {
    assignPhase(VaultPhase.LIQUIDATING);
    updateUiState();
  };

  /** @type {OfferHandler} */
  const closeHook = async seat => {
    assertCloseable();
    const { phase, vaultSeat } = state;
    if (phase === VaultPhase.ACTIVE) {
      assertProposalShape(seat, {
        give: { RUN: null },
        want: { Collateral: null },
      });

      // you're paying off the debt, you get everything back. If you were
      // underwater, we should have liquidated some collateral earlier: we
      // missed our chance.
      const debt = getCurrentDebt();
      const {
        give: { RUN: runOffered },
      } = seat.getProposal();

      // you must pay off the entire remainder but if you offer too much, we won't
      // take more than you owe
      assert(
        AmountMath.isGTE(runOffered, debt),
        X`Offer ${runOffered} is not sufficient to pay off debt ${debt}`,
      );

      // Return any overpayment
      seat.incrementBy(
        vaultSeat.decrementBy(
          harden({ Collateral: getCollateralAllocated(vaultSeat) }),
        ),
      );
      zcf.reallocate(seat, vaultSeat);
      mint.burnLosses(harden({ RUN: debt }), seat);
    } else if (phase === VaultPhase.LIQUIDATED) {
      // Simply reallocate vault assets to the offer seat.
      // Don't take anything from the offer, even if vault is underwater.
      seat.incrementBy(vaultSeat.decrementBy(vaultSeat.getCurrentAllocation()));
      zcf.reallocate(seat, vaultSeat);
    } else {
      throw new Error('only active and liquidated vaults can be closed');
    }

    seat.exit();
    assignPhase(VaultPhase.CLOSED);
    updateDebtSnapshot(emptyDebt);
    updateUiState();

    assertVaultHoldsNoRun();
    vaultSeat.exit();

    return 'your loan is closed, thank you for your business';
  };

  const makeCloseInvitation = () => {
    assertCloseable();
    return zcf.makeInvitation(closeHook, 'CloseVault');
  };

  // The proposal is not allowed to include any keys other than these,
  // usually 'Collateral' and 'RUN'.
  const assertOnlyKeys = (proposal, keys) => {
    const onlyKeys = clause =>
      Object.getOwnPropertyNames(clause).every(c => keys.includes(c));
    assert(
      onlyKeys(proposal.give),
      X`extraneous terms in give: ${proposal.give}`,
    );
    assert(
      onlyKeys(proposal.want),
      X`extraneous terms in want: ${proposal.want}`,
    );
  };

  /**
   * Stage a transfer between `fromSeat` and `toSeat`, specified as the delta
   * between the gain and a loss on the `fromSeat`. The gain/loss are typically
   * from the give/want respectively of a proposal. The `key` is the allocation keyword.
   *
   * @param {ZCFSeat} fromSeat
   * @param {ZCFSeat} toSeat
   * @param {Amount} fromLoses
   * @param {Amount} fromGains
   * @param {Keyword} key
   */
  const transfer = (fromSeat, toSeat, fromLoses, fromGains, key) => {
    // Must check `isEmpty`; can't subtract `empty` from a missing allocation.
    if (!AmountMath.isEmpty(fromLoses)) {
      toSeat.incrementBy(fromSeat.decrementBy(harden({ [key]: fromLoses })));
    }
    if (!AmountMath.isEmpty(fromGains)) {
      fromSeat.incrementBy(toSeat.decrementBy(harden({ [key]: fromGains })));
    }
  };

  /**
   * Apply a delta to the `base` Amount, where the delta is represented as an
   * amount to gain and an amount to lose. Typically one of those will be empty
   * because gain/loss comes from the give/want for a specific asset on a
   * proposal. We use two Amounts because an Amount cannot represent a negative
   * number (so we use a "loss" that will be subtracted).
   *
   * @param {Amount} base
   * @param {Amount} gain
   * @param {Amount} loss
   * @returns {Amount}
   */
  const applyDelta = (base, gain, loss) =>
    AmountMath.subtract(AmountMath.add(base, gain), loss);

  /**
   * Calculate the fee, the amount to mint and the resulting debt. The give and
   * the want together reflect a delta, where typically one is zero because they
   * come from the gave/want of an offer proposal. If the `want` is zero, the
   * `fee` will also be zero, so the simple math works.
   *
   * @param {Amount} currentDebt
   * @param {Amount} giveAmount
   * @param {Amount} wantAmount
   */
  const loanFee = (currentDebt, giveAmount, wantAmount) => {
    const fee = ceilMultiplyBy(wantAmount, manager.getLoanFee());
    const toMint = AmountMath.add(wantAmount, fee);
    const newDebt = applyDelta(currentDebt, toMint, giveAmount);
    return { newDebt, toMint, fee };
  };

  /**
   * Check whether we can proceed with an `adjustBalances`.
   *
   * @param {Amount} newCollateralPre
   * @param {Amount} maxDebtPre
   * @param {Amount} newCollateral
   * @param {Amount} newDebt
   * @returns {boolean}
   */
  const checkRestart = (
    newCollateralPre,
    maxDebtPre,
    newCollateral,
    newDebt,
  ) => {
    if (AmountMath.isGTE(newCollateralPre, newCollateral)) {
      // The collateral did not go up. If the collateral decreased, we pro-rate maxDebt.
      // We can pro-rate maxDebt because the quote is either linear (price is
      // unchanging) or super-linear (also called "convex"). Super-linear is from
      // AMMs: selling less collateral would mean an even smaller price impact, so
      // this is a conservative choice.
      const runPerCollateral = makeRatioFromAmounts(
        maxDebtPre,
        newCollateralPre,
      );
      // `floorMultiply` because the debt ceiling should be tight
      const maxDebtAfter = floorMultiplyBy(newCollateral, runPerCollateral);
      assert(
        AmountMath.isGTE(maxDebtAfter, newDebt),
        X`The requested debt ${q(
          newDebt,
        )} is more than the collateralization ratio allows: ${q(maxDebtAfter)}`,
      );
      // The `collateralAfter` can still cover the `newDebt`, so don't restart.
      return false;
    }
    // The collateral went up. Restart if the debt *also* went up because
    // the price quote might not apply at the higher numbers.
    return !AmountMath.isGTE(maxDebtPre, newDebt);
  };

  /**
   * Adjust principal and collateral (atomically for offer safety)
   *
   * @param {ZCFSeat} clientSeat
   */
  const adjustBalancesHook = async clientSeat => {
    const { vaultSeat, outerUpdater: updaterPre } = state;
    const proposal = clientSeat.getProposal();
    assertOnlyKeys(proposal, ['Collateral', 'RUN']);

    const debtPre = getCurrentDebt();
    const collateralPre = getCollateralAllocated(vaultSeat);

    const giveColl = proposal.give.Collateral || emptyCollateral;
    const wantColl = proposal.want.Collateral || emptyCollateral;

    const newCollateralPre = applyDelta(collateralPre, giveColl, wantColl);
    // max debt supported by current Collateral as modified by proposal
    const maxDebtPre = await maxDebtFor(newCollateralPre);
    assert(
      updaterPre === state.outerUpdater,
      X`Transfer during vault adjustment`,
    );
    assertActive();

    // After the AWAIT, we retrieve the vault's allocations again.
    // Get new balances after calling the priceAuthority, so we can compare
    // to the debt limit based on the new values.
    const collateral = getCollateralAllocated(vaultSeat);
    const newCollateral = applyDelta(collateral, giveColl, wantColl);

    const debt = getCurrentDebt();
    const giveRUN = AmountMath.min(proposal.give.RUN || emptyDebt, debt);
    const wantRUN = proposal.want.RUN || emptyDebt;

    // Calculate the fee, the amount to mint and the resulting debt. We'll
    // verify that the target debt doesn't violate the collateralization ratio,
    // then mint, reallocate, and burn.
    const { newDebt, fee, toMint } = loanFee(debt, giveRUN, wantRUN);

    trace('adjustBalancesHook', {
      newCollateralPre,
      newCollateral,
      fee,
      toMint,
      newDebt,
    });

    if (checkRestart(newCollateralPre, maxDebtPre, newCollateral, newDebt)) {
      return adjustBalancesHook(clientSeat);
    }

    // mint to vaultSeat, then reallocate to reward and client, then burn from
    // vaultSeat. Would using a separate seat clarify the accounting?
    // TODO what if there isn't anything to mint?
    mint.mintGains(harden({ RUN: toMint }), vaultSeat);

    transfer(clientSeat, vaultSeat, giveColl, wantColl, 'Collateral');
    transfer(clientSeat, vaultSeat, giveRUN, wantRUN, 'RUN');
    manager.reallocateWithFee(fee, vaultSeat, clientSeat);

    // parent needs to know about the change in debt
    updateDebtAccounting(debtPre, collateralPre, newDebt);

    mint.burnLosses(harden({ RUN: giveRUN }), vaultSeat);

    assertVaultHoldsNoRun();

    updateUiState();
    clientSeat.exit();

    return 'We have adjusted your balances, thank you for your business';
  };

  const makeAdjustBalancesInvitation = () => {
    assertActive();
    return zcf.makeInvitation(adjustBalancesHook, 'AdjustBalances');
  };

  /**
   * @param {ZCFSeat} seat
   * @param {InnerVault} innerVault
   */
  const initVaultKit = async (seat, innerVault) => {
    assert(
      AmountMath.isEmpty(state.debtSnapshot),
      X`vault must be empty initially`,
    );
    // TODO should this be simplified to know that the oldDebt mut be empty?
    const debtPre = getCurrentDebt();
    const collateralPre = getCollateralAmount();
    trace('initVaultKit start: collateral', { debtPre, collateralPre });

    // get the payout to provide access to the collateral if the
    // contract abandons
    const {
      give: { Collateral: giveCollateral },
      want: { RUN: wantRUN },
    } = seat.getProposal();

    const {
      newDebt: newDebtPre,
      fee,
      toMint,
    } = loanFee(debtPre, emptyDebt, wantRUN);
    assert(
      !AmountMath.isEmpty(fee),
      X`loan requested (${wantRUN}) is too small; cannot accrue interest`,
    );
    assert(AmountMath.isEqual(newDebtPre, toMint), X`fee mismatch for vault`);
    trace(
      idInManager,
      'initVault',
      { wantedRun: wantRUN, fee },
      getCollateralAmount(),
    );

    await assertSufficientCollateral(giveCollateral, newDebtPre);

    const { vaultSeat } = state;
    mint.mintGains(harden({ RUN: toMint }), vaultSeat);

    seat.incrementBy(vaultSeat.decrementBy(harden({ RUN: wantRUN })));
    vaultSeat.incrementBy(
      seat.decrementBy(harden({ Collateral: giveCollateral })),
    );
    manager.reallocateWithFee(fee, vaultSeat, seat);

    updateDebtAccounting(debtPre, collateralPre, newDebtPre);

    const vaultKit = makeVaultKit(innerVault, state.assetNotifier);
    state.outerUpdater = vaultKit.vaultUpdater;
    updateUiState();

    return vaultKit;
  };

  /**
   * @param {ZCFSeat} seat
   * @returns {VaultKit}
   */
  const makeTransferInvitationHook = seat => {
    assertCloseable();
    seat.exit();
    // eslint-disable-next-line no-use-before-define
    const vaultKit = makeVaultKit(innerVault, state.assetNotifier);
    state.outerUpdater = vaultKit.vaultUpdater;
    updateUiState();

    return vaultKit;
  };

  const innerVault = Far('innerVault', {
    getVaultSeat: () => state.vaultSeat,

    initVaultKit: seat => initVaultKit(seat, innerVault),
    liquidating,
    liquidated,

    makeAdjustBalancesInvitation,
    makeCloseInvitation,
    makeTransferInvitation: () => {
      // Bring the debt snapshot current for the final report before transfer
      updateDebtSnapshot(getCurrentDebt());
      const {
        outerUpdater,
        debtSnapshot: debt,
        interestSnapshot: interest,
        phase,
      } = state;
      if (outerUpdater) {
        outerUpdater.finish(snapshotState(VaultPhase.TRANSFER));
        state.outerUpdater = null;
      }
      const transferState = {
        debtSnapshot: { debt, interest },
        locked: getCollateralAmount(),
        vaultState: phase,
      };
      return zcf.makeInvitation(
        makeTransferInvitationHook,
        'TransferVault',
        transferState,
      );
    },

    // for status/debugging
    getCollateralAmount,
    getCurrentDebt,
    getNormalizedDebt,
  });

  return innerVault;
};

/** @typedef {ReturnType<typeof makeInnerVault>} InnerVault */
