// @ts-check
import '@agoric/zoe/exported.js';

import {
  assertProposalShape,
  makeRatioFromAmounts,
  ceilMultiplyBy,
  floorMultiplyBy,
} from '@agoric/zoe/src/contractSupport/index.js';
import { assert } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { defineKindMulti, pickFacet } from '@agoric/vat-data';
import { makeTracer } from '../makeTracer.js';
import { calculateCurrentDebt, reverseInterest } from '../interest-math.js';
import { makeVaultKit } from './vaultKit.js';
import { addSubtract, assertOnlyKeys, stageDelta } from '../contractSupport.js';

const { details: X, quote: q } = assert;

const trace = makeTracer('IV', false);

/**
 * @file This has most of the logic for a Vault, to borrow RUN against collateral.
 *
 * The logic here is for InnerVault which is the majority of logic of vaults but
 * the user view is the `vault` value contained in VaultKit.
 *
 * A note on naming convention:
 * - `Pre` is used as a postfix for any mutable value retrieved *before* an
 *    `await`, to flag values that must used very carefully after the `await`
 * - `new` is a prefix for values that describe the result of executing a
 *   transaction; e.g., `debt` is the value before the txn, and `newDebt`
 *   will be value if the txn completes.
 * - the absence of one of these implies the opposite, so `newDebt` is the
 *   future value fo `debt`, as computed based on values after any `await`
 */

/**
 * Constants for vault phase.
 *
 * ACTIVE       - vault is in use and can be changed
 * LIQUIDATING  - vault is being liquidated by the vault manager, and cannot be changed by the user
 * TRANSFER     - vault is able to be transferred (payments and debits frozen until it has a new owner)
 * CLOSED       - vault was closed by the user and all assets have been paid out
 * LIQUIDATED   - vault was closed by the manager, with remaining assets paid to owner
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
 * @type {{[K in InnerPhase]: Array<InnerPhase>}}
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
 * @property {{debt: Amount<'nat'>, interest: Ratio}} debtSnapshot 'debt' at the point the compounded interest was 'interest'
 * @property {Ratio} interestRate Annual interest rate charge
 * @property {Ratio} liquidationRatio
 * @property {OuterPhase} vaultState
 */

/**
 * @typedef {Object} InnerVaultManager
 * @property {() => Notifier<import('./vaultManager').AssetState>} getNotifier
 * @property {(collateralAmount: Amount) => ERef<Amount>} maxDebtFor
 * @property {() => Brand} getCollateralBrand
 * @property {() => Brand} getDebtBrand
 * @property {MintAndReallocate} mintAndReallocate
 * @property {(amount: Amount, seat: ZCFSeat) => void} burnAndRecord
 * @property {() => Ratio} getCompoundedInterest
 * @property {(oldDebt: Amount, oldCollateral: Amount, vaultId: VaultId) => void} updateVaultPriority
 * @property {() => import('./vaultManager.js').GovernedParamGetters} getGovernedParams
 */

/**
 * @typedef {Readonly<{
 * idInManager: VaultId,
 * manager: InnerVaultManager,
 * vaultSeat: ZCFSeat,
 * zcf: ZCF,
 * }>} ImmutableState
 */

/**
 * Snapshot is of the debt and compounded interest when the principal was last changed.
 *
 * @typedef {{
 *   interestSnapshot: Ratio,
 *   outerUpdater: IterationObserver<VaultUIState> | null,
 *   phase: InnerPhase,
 *   debtSnapshot: Amount<'nat'>,
 * }} MutableState
 */

/**
 * @typedef {Readonly<{
 *   state: ImmutableState & MutableState,
 *   facets: {
 *     self: import('@agoric/vat-data/src/types').KindFacet<typeof selfBehavior>,
 *     helper: import('@agoric/vat-data/src/types').KindFacet<typeof helperBehavior>,
 *   },
 * }>} MethodContext
 */

/**
 * @param {ZCF} zcf
 * @param {InnerVaultManager} manager
 * @param {VaultId} idInManager
 */
const initState = (zcf, manager, idInManager) => {
  /**
   * @type {ImmutableState & MutableState}
   */
  return harden({
    idInManager,
    manager,
    outerUpdater: null,
    phase: VaultPhase.ACTIVE,
    zcf,

    // vaultSeat will hold the collateral until the loan is retired. The
    // payout from it will be handed to the user: if the vault dies early
    // (because the vaultFactory vat died), they'll get all their
    // collateral back. If that happens, the issuer for the RUN will be dead,
    // so their loan will be worthless.
    vaultSeat: zcf.makeEmptySeatKit().zcfSeat,

    // Two values from the same moment
    interestSnapshot: manager.getCompoundedInterest(),
    debtSnapshot: AmountMath.makeEmpty(manager.getDebtBrand()),
  });
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
const checkRestart = (newCollateralPre, maxDebtPre, newCollateral, newDebt) => {
  if (AmountMath.isGTE(newCollateralPre, newCollateral)) {
    // The collateral did not go up. If the collateral decreased, we pro-rate maxDebt.
    // We can pro-rate maxDebt because the quote is either linear (price is
    // unchanging) or super-linear (also called "convex"). Super-linear is from
    // AMMs: selling less collateral would mean an even smaller price impact, so
    // this is a conservative choice.
    const debtPerCollateral = makeRatioFromAmounts(
      maxDebtPre,
      newCollateralPre,
    );
    // `floorMultiply` because the debt ceiling should be tight
    const maxDebtAfter = floorMultiplyBy(newCollateral, debtPerCollateral);
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

const helperBehavior = {
  // #region Computed constants
  collateralBrand: ({ state }) => state.manager.getCollateralBrand(),
  debtBrand: ({ state }) => state.manager.getDebtBrand(),

  emptyCollateral: ({ facets }) =>
    AmountMath.makeEmpty(facets.helper.collateralBrand()),
  emptyDebt: ({ facets }) => AmountMath.makeEmpty(facets.helper.debtBrand()),
  // #endregion

  // #region Phase logic
  /**
   * @param {MethodContext} context
   * @param {InnerPhase} newPhase
   */
  assignPhase: ({ state }, newPhase) => {
    const { phase } = state;
    const validNewPhases = validTransitions[phase];
    assert(
      validNewPhases.includes(newPhase),
      `Vault cannot transition from ${phase} to ${newPhase}`,
    );
    state.phase = newPhase;
  },

  assertActive: ({ state }) => {
    const { phase } = state;
    assert(phase === VaultPhase.ACTIVE);
  },

  assertCloseable: ({ state }) => {
    const { phase } = state;
    assert(
      phase === VaultPhase.ACTIVE || phase === VaultPhase.LIQUIDATED,
      X`to be closed a vault must be active or liquidated, not ${phase}`,
    );
  },
  // #endregion

  /**
   * Called whenever the debt is paid or created through a transaction,
   * but not for interest accrual.
   *
   * @param {MethodContext} context
   * @param {Amount} newDebt - principal and all accrued interest
   */
  updateDebtSnapshot: ({ state }, newDebt) => {
    // update local state
    state.debtSnapshot = newDebt;
    state.interestSnapshot = state.manager.getCompoundedInterest();
  },

  /**
   * Update the debt balance and propagate upwards to
   * maintain aggregate debt and liquidation order.
   *
   * @param {MethodContext} context
   * @param {Amount} oldDebt - prior principal and all accrued interest
   * @param {Amount} oldCollateral - actual collateral
   * @param {Amount} newDebt - actual principal and all accrued interest
   */
  updateDebtAccounting: (
    { state, facets },
    oldDebt,
    oldCollateral,
    newDebt,
  ) => {
    const { helper } = facets;
    helper.updateDebtSnapshot(newDebt);
    // update position of this vault in liquidation priority queue
    state.manager.updateVaultPriority(
      oldDebt,
      oldCollateral,
      state.idInManager,
    );
  },

  /**
   *
   * @param {MethodContext} context
   * @param {ZCFSeat} seat
   */
  getCollateralAllocated: ({ facets }, seat) =>
    seat.getAmountAllocated('Collateral', facets.helper.collateralBrand()),
  getRunAllocated: ({ facets }, seat) =>
    seat.getAmountAllocated('RUN', facets.helper.debtBrand()),

  assertVaultHoldsNoRun: ({ state, facets }) => {
    const { vaultSeat } = state;
    assert(
      AmountMath.isEmpty(facets.helper.getRunAllocated(vaultSeat)),
      X`Vault should be empty of RUN`,
    );
  },

  /**
   *
   * @param {MethodContext} context
   * @param {Amount<'nat'>} collateralAmount
   * @param {Amount<'nat'>} proposedRunDebt
   */
  assertSufficientCollateral: async (
    { state, facets },
    collateralAmount,
    proposedRunDebt,
  ) => {
    const maxRun = await state.manager.maxDebtFor(collateralAmount);
    assert(
      AmountMath.isGTE(maxRun, proposedRunDebt, facets.helper.debtBrand()),
      X`Requested ${q(proposedRunDebt)} exceeds max ${q(maxRun)}`,
    );
  },

  /**
   *
   * @param {MethodContext} context
   * @param {OuterPhase} newPhase
   */
  snapshotState: ({ state, facets }, newPhase) => {
    const { debtSnapshot: debt, interestSnapshot: interest } = state;
    /** @type {VaultUIState} */
    return harden({
      // TODO move manager state to a separate notifer https://github.com/Agoric/agoric-sdk/issues/4540
      interestRate: state.manager.getGovernedParams().getInterestRate(),
      liquidationRatio: state.manager
        .getGovernedParams()
        .getLiquidationMargin(),
      debtSnapshot: { debt, interest },
      locked: facets.self.getCollateralAmount(),
      // newPhase param is so that makeTransferInvitation can finish without setting the vault's phase
      // TODO refactor https://github.com/Agoric/agoric-sdk/issues/4415
      vaultState: newPhase,
    });
  },

  /**
   * call this whenever anything changes!
   *
   * @param {MethodContext} context
   */
  updateUiState: ({ state, facets }) => {
    const { outerUpdater } = state;
    if (!outerUpdater) {
      console.warn('updateUiState called after outerUpdater removed');
      return;
    }
    const { phase } = state;
    const uiState = facets.helper.snapshotState(phase);
    trace('updateUiState', state.idInManager, uiState);

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
  },

  /**
   * @param {MethodContext} context
   * @param {ZCFSeat} seat
   */
  closeHook: async ({ state, facets }, seat) => {
    const { self, helper } = facets;
    helper.assertCloseable();
    const { phase, vaultSeat } = state;
    if (phase === VaultPhase.ACTIVE) {
      assertProposalShape(seat, {
        give: { RUN: null },
      });

      // you're paying off the debt, you get everything back.
      const debt = self.getCurrentDebt();
      const {
        give: { RUN: given },
      } = seat.getProposal();

      // you must pay off the entire remainder but if you offer too much, we won't
      // take more than you owe
      assert(
        AmountMath.isGTE(given, debt),
        X`Offer ${given} is not sufficient to pay off debt ${debt}`,
      );

      // Return any overpayment
      seat.incrementBy(vaultSeat.decrementBy(vaultSeat.getCurrentAllocation()));
      state.zcf.reallocate(seat, vaultSeat);
      state.manager.burnAndRecord(debt, seat);
    } else if (phase === VaultPhase.LIQUIDATED) {
      // Simply reallocate vault assets to the offer seat.
      // Don't take anything from the offer, even if vault is underwater.
      // TODO verify that returning RUN here doesn't mess up debt limits
      seat.incrementBy(vaultSeat.decrementBy(vaultSeat.getCurrentAllocation()));
      state.zcf.reallocate(seat, vaultSeat);
    } else {
      throw new Error('only active and liquidated vaults can be closed');
    }

    seat.exit();
    helper.assignPhase(VaultPhase.CLOSED);
    helper.updateDebtSnapshot(helper.emptyDebt());
    helper.updateUiState();

    helper.assertVaultHoldsNoRun();
    vaultSeat.exit();

    return 'your loan is closed, thank you for your business';
  },

  /**
   * Calculate the fee, the amount to mint and the resulting debt.
   * The give and the want together reflect a delta, where typically
   * one is zero because they come from the gave/want of an offer
   * proposal. If the `want` is zero, the `fee` will also be zero,
   * so the simple math works.
   *
   * @param {MethodContext} context
   * @param {Amount} currentDebt
   * @param {Amount} giveAmount
   * @param {Amount} wantAmount
   */
  loanFee: ({ state }, currentDebt, giveAmount, wantAmount) => {
    const fee = ceilMultiplyBy(
      wantAmount,
      state.manager.getGovernedParams().getLoanFee(),
    );
    const toMint = AmountMath.add(wantAmount, fee);
    const newDebt = addSubtract(currentDebt, toMint, giveAmount);
    return { newDebt, toMint, fee };
  },

  /**
   * Adjust principal and collateral (atomically for offer safety)
   *
   * @param {MethodContext} context
   * @param {ZCFSeat} clientSeat
   * @returns {Promise<string>} success message
   */
  handleAdjustBalancesOffer: async ({ state, facets }, clientSeat) => {
    const { self, helper } = facets;
    const { vaultSeat, outerUpdater: updaterPre } = state;
    const proposal = clientSeat.getProposal();
    assertOnlyKeys(proposal, ['Collateral', 'RUN']);

    const debtPre = self.getCurrentDebt();
    const collateralPre = helper.getCollateralAllocated(vaultSeat);

    const giveColl = proposal.give.Collateral || helper.emptyCollateral();
    const wantColl = proposal.want.Collateral || helper.emptyCollateral();

    const newCollateralPre = addSubtract(collateralPre, giveColl, wantColl);
    // max debt supported by current Collateral as modified by proposal
    const maxDebtPre = await state.manager.maxDebtFor(newCollateralPre);
    assert(
      updaterPre === state.outerUpdater,
      X`Transfer during vault adjustment`,
    );
    helper.assertActive();

    // After the `await`, we retrieve the vault's allocations again,
    // so we can compare to the debt limit based on the new values.
    const collateral = helper.getCollateralAllocated(vaultSeat);
    const newCollateral = addSubtract(collateral, giveColl, wantColl);

    const debt = self.getCurrentDebt();
    const giveRUN = AmountMath.min(
      proposal.give.RUN || helper.emptyDebt(),
      debt,
    );
    const wantRUN = proposal.want.RUN || helper.emptyDebt();

    // Calculate the fee, the amount to mint and the resulting debt. We'll
    // verify that the target debt doesn't violate the collateralization ratio,
    // then mint, reallocate, and burn.
    const { newDebt, fee, toMint } = helper.loanFee(debt, giveRUN, wantRUN);

    trace('adjustBalancesHook', state.idInManager, {
      newCollateralPre,
      newCollateral,
      fee,
      toMint,
      newDebt,
    });

    if (checkRestart(newCollateralPre, maxDebtPre, newCollateral, newDebt)) {
      return helper.handleAdjustBalancesOffer(clientSeat);
    }

    stageDelta(clientSeat, vaultSeat, giveColl, wantColl, 'Collateral');
    // `wantRUN` is allocated in the reallocate and mint operation, and so not here
    stageDelta(clientSeat, vaultSeat, giveRUN, helper.emptyDebt(), 'RUN');
    state.manager.mintAndReallocate(toMint, fee, clientSeat, vaultSeat);

    // parent needs to know about the change in debt
    helper.updateDebtAccounting(debtPre, collateralPre, newDebt);
    state.manager.burnAndRecord(giveRUN, vaultSeat);
    helper.assertVaultHoldsNoRun();

    helper.updateUiState();
    clientSeat.exit();
    return 'We have adjusted your balances, thank you for your business';
  },

  /**
   *
   * @param {MethodContext} context
   * @param {ZCFSeat} seat
   * @returns {VaultKit}
   */
  makeTransferInvitationHook: ({ state, facets }, seat) => {
    const { self, helper } = facets;
    helper.assertCloseable();
    seat.exit();
    // eslint-disable-next-line no-use-before-define
    const vaultKit = makeVaultKit(self, state.manager.getNotifier());
    state.outerUpdater = vaultKit.vaultUpdater;
    helper.updateUiState();

    return vaultKit;
  },
};

const selfBehavior = {
  /**
   * @param {MethodContext} context
   */
  getVaultSeat: ({ state }) => state.vaultSeat,

  /**
   * @param {MethodContext} context
   * @param {ZCFSeat} seat
   */
  initVaultKit: async ({ state, facets }, seat) => {
    const { self, helper } = facets;
    assert(
      AmountMath.isEmpty(state.debtSnapshot),
      X`vault must be empty initially`,
    );
    // TODO should this be simplified to know that the oldDebt mut be empty?
    const debtPre = self.getCurrentDebt();
    const collateralPre = self.getCollateralAmount();
    trace('initVaultKit start: collateral', state.idInManager, {
      debtPre,
      collateralPre,
    });

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
    } = helper.loanFee(debtPre, helper.emptyDebt(), wantRUN);
    assert(
      !AmountMath.isEmpty(fee),
      X`loan requested (${wantRUN}) is too small; cannot accrue interest`,
    );
    assert(AmountMath.isEqual(newDebtPre, toMint), X`fee mismatch for vault`);
    trace(
      'initVault',
      state.idInManager,
      { wantedRun: wantRUN, fee },
      self.getCollateralAmount(),
    );

    await helper.assertSufficientCollateral(giveCollateral, newDebtPre);

    const { vaultSeat } = state;
    vaultSeat.incrementBy(
      seat.decrementBy(harden({ Collateral: giveCollateral })),
    );
    state.manager.mintAndReallocate(toMint, fee, seat, vaultSeat);
    helper.updateDebtAccounting(debtPre, collateralPre, newDebtPre);

    const vaultKit = makeVaultKit(self, state.manager.getNotifier());
    state.outerUpdater = vaultKit.vaultUpdater;
    helper.updateUiState();
    return vaultKit;
  },

  /**
   * @param {MethodContext} context
   */
  liquidating: ({ facets }) => {
    const { helper } = facets;
    helper.assignPhase(VaultPhase.LIQUIDATING);
    helper.updateUiState();
  },

  /**
   * Call must check for and remember shortfall
   *
   * @param {MethodContext} context
   * @param {Amount} newDebt
   */
  liquidated: ({ facets }, newDebt) => {
    const { helper } = facets;
    helper.updateDebtSnapshot(newDebt);

    helper.assignPhase(VaultPhase.LIQUIDATED);
    helper.updateUiState();
  },

  /**
   * @param {MethodContext} context
   */
  makeAdjustBalancesInvitation: ({ state, facets }) => {
    const { helper } = facets;
    helper.assertActive();
    return state.zcf.makeInvitation(
      helper.handleAdjustBalancesOffer,
      'AdjustBalances',
    );
  },

  /**
   * @param {MethodContext} context
   */
  makeCloseInvitation: ({ state, facets }) => {
    const { helper } = facets;
    helper.assertCloseable();
    return state.zcf.makeInvitation(helper.closeHook, 'CloseVault');
  },

  /**
   * @param {MethodContext} context
   * @returns {Promise<unknown>}
   */
  makeTransferInvitation: ({ state, facets }) => {
    const { self, helper } = facets;
    // Bring the debt snapshot current for the final report before transfer
    helper.updateDebtSnapshot(self.getCurrentDebt());
    const {
      outerUpdater,
      debtSnapshot: debt,
      interestSnapshot: interest,
      phase,
    } = state;
    if (outerUpdater) {
      outerUpdater.finish(helper.snapshotState(VaultPhase.TRANSFER));
      state.outerUpdater = null;
    }
    const transferState = {
      debtSnapshot: { debt, interest },
      locked: self.getCollateralAmount(),
      vaultState: phase,
    };
    return state.zcf.makeInvitation(
      helper.makeTransferInvitationHook,
      'TransferVault',
      transferState,
    );
  },

  // for status/debugging

  /**
   *
   * @param {MethodContext} context
   * @returns {Amount<'nat'>}
   */
  getCollateralAmount: ({ state, facets }) => {
    const { vaultSeat } = state;
    const { helper } = facets;
    // getCollateralAllocated would return final allocations
    return vaultSeat.hasExited()
      ? helper.emptyCollateral()
      : helper.getCollateralAllocated(vaultSeat);
  },

  /**
   * The actual current debt, including accrued interest.
   *
   * This looks like a simple getter but it does a lot of the heavy lifting for
   * interest accrual. Rather than updating all records when interest accrues,
   * the vault manager updates just its rolling compounded interest. Here we
   * calculate what the current debt is given what's recorded in this vault and
   * what interest has compounded since this vault record was written.
   *
   * @see getNormalizedDebt
   *
   * @param {MethodContext} context
   * @returns {Amount<'nat'>}
   */
  getCurrentDebt: ({ state }) => {
    return calculateCurrentDebt(
      state.debtSnapshot,
      state.interestSnapshot,
      state.manager.getCompoundedInterest(),
    );
  },

  /**
   * The normalization puts all debts on a common time-independent scale since
   * the launch of this vault manager. This allows the manager to order vaults
   * by their debt-to-collateral ratios without having to mutate the debts as
   * the interest accrues.
   *
   * @see getActualDebAmount
   *
   * @param {MethodContext} context
   * @returns {Amount<'nat'>} as if the vault was open at the launch of this manager, before any interest accrued
   */
  getNormalizedDebt: ({ state }) => {
    return reverseInterest(state.debtSnapshot, state.interestSnapshot);
  },
};

const makeInnerVaultBase = defineKindMulti('InnerVault', initState, {
  self: selfBehavior,
  helper: helperBehavior,
});

/**
 * @param {ZCF} zcf
 * @param {InnerVaultManager} manager
 * @param {VaultId} idInManager
 */
export const makeInnerVault = pickFacet(makeInnerVaultBase, 'self');

/** @typedef {ReturnType<typeof makeInnerVault>} InnerVault */
