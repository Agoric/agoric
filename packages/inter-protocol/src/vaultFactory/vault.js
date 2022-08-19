// @ts-check
import '@agoric/zoe/exported.js';

import {
  assertProposalShape,
  makeRatioFromAmounts,
  ceilMultiplyBy,
  floorMultiplyBy,
} from '@agoric/zoe/src/contractSupport/index.js';
import { AmountMath } from '@agoric/ertp';
import {
  defineDurableKindMulti,
  makeKindHandle,
  pickFacet,
} from '@agoric/vat-data';
import { makeTracer } from '../makeTracer.js';
import { calculateCurrentDebt, reverseInterest } from '../interest-math.js';
import { makeVaultKit } from './vaultKit.js';
import {
  addSubtract,
  assertOnlyKeys,
  makeEphemeraProvider,
  stageDelta,
} from '../contractSupport.js';

const { details: X, quote: q } = assert;

const trace = makeTracer('IV', false);

/** @typedef {import('./storeUtils.js').NormalizedDebt} NormalizedDebt */

/**
 * @file This has most of the logic for a Vault, to borrow Minted against collateral.
 *
 * The logic here is for Vault which is the majority of logic of vaults but
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
 * LIQUIDATING  - vault is being liquidated by the vault manager, and cannot be changed by the user.
 *                If liquidation fails, vaults may remain in this state. An upgrade to the contract
 *                might be able to recover them.
 * TRANSFER     - vault is able to be transferred (payments and debits frozen until it has a new owner)
 * CLOSED       - vault was closed by the user and all assets have been paid out
 * LIQUIDATED   - vault was closed by the manager, with remaining assets paid to owner
 */
export const Phase = /** @type {const} */ ({
  ACTIVE: 'active',
  LIQUIDATING: 'liquidating',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  TRANSFER: 'transfer',
});

/**
 * @typedef {Phase[keyof Omit<typeof Phase, 'TRANSFER'>]} VaultPhase
 * @type {{[K in VaultPhase]: Array<VaultPhase>}}
 */
const validTransitions = {
  [Phase.ACTIVE]: [Phase.LIQUIDATING, Phase.CLOSED],
  [Phase.LIQUIDATING]: [Phase.LIQUIDATED],
  [Phase.LIQUIDATED]: [Phase.CLOSED],
  [Phase.CLOSED]: [],
};

/**
 * @typedef {Phase[keyof typeof Phase]} HolderPhase
 *
 * @typedef {object} VaultNotification
 * @property {Amount<'nat'>} locked Amount of Collateral locked
 * @property {{debt: Amount<'nat'>, interest: Ratio}} debtSnapshot 'debt' at the point the compounded interest was 'interest'
 * @property {HolderPhase} vaultState
 */

// XXX masks typedef from types.js, but using that causes circular def problems
/**
 * @typedef {object} VaultManager
 * @property {() => Subscriber<import('./vaultManager').AssetState>} getAssetSubscriber
 * @property {(collateralAmount: Amount) => ERef<Amount<'nat'>>} maxDebtFor
 * @property {() => Brand} getCollateralBrand
 * @property {() => Brand<'nat'>} getDebtBrand
 * @property {MintAndReallocate} mintAndReallocate
 * @property {(amount: Amount, seat: ZCFSeat) => void} burnAndRecord
 * @property {() => Ratio} getCompoundedInterest
 * @property {(oldDebt: import('./storeUtils.js').NormalizedDebt, oldCollateral: Amount<'nat'>, vaultId: VaultId, vaultPhase: VaultPhase, vault: Vault) => void} handleBalanceChange
 * @property {() => import('./vaultManager.js').GovernedParamGetters} getGovernedParams
 */

/**
 * @typedef {Readonly<{
 * idInManager: VaultId,
 * manager: VaultManager,
 * vaultSeat: ZCFSeat,
 * }>} ImmutableState
 */

/**
 * Snapshot is of the debt and compounded interest when the principal was last changed.
 *
 * @typedef {{
 *   interestSnapshot: Ratio,
 *   phase: VaultPhase,
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
 * Ephemera are the elements of state that cannot (or need not) be durable.
 * When there's a single instance it can be held in a closure, but there are
 * many vault manaager objects. So we hold their ephemera keyed by the durable
 * vault manager object reference.
 *
 * @type {(key: VaultId) => {
 * storageNode: ERef<StorageNode>,
 * marshaller: ERef<Marshaller>,
 * outerUpdater: Publisher<VaultNotification> | null,
 * zcf: ZCF,
 * }} */
// @ts-expect-error not yet defined
const provideEphemera = makeEphemeraProvider(() => ({}));

/**
 * @param {ZCF} zcf
 * @param {VaultManager} manager
 * @param {VaultId} idInManager
 * @param {ERef<StorageNode>} storageNode
 * @param {ERef<Marshaller>} marshaller
 */
const initState = (zcf, manager, idInManager, storageNode, marshaller) => {
  const ephemera = provideEphemera(idInManager);
  ephemera.storageNode = storageNode;
  ephemera.marshaller = marshaller;
  ephemera.zcf = zcf;

  /**
   * @type {ImmutableState & MutableState}
   */
  return harden({
    idInManager,
    manager,
    outerUpdater: null,
    phase: Phase.ACTIVE,

    // vaultSeat will hold the collateral until the loan is retired. The
    // payout from it will be handed to the user: if the vault dies early
    // (because the vaultFactory vat died), they'll get all their
    // collateral back. If that happens, the issuer for the Minted will be dead,
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
   * @param {VaultPhase} newPhase
   */
  assignPhase: ({ state }, newPhase) => {
    const { phase } = state;
    const validNewPhases = validTransitions[phase];
    assert(
      validNewPhases.includes(newPhase),
      X`Vault cannot transition from ${q(phase)} to ${q(newPhase)}`,
    );
    state.phase = newPhase;
  },

  assertActive: ({ state }) => {
    const { phase } = state;
    assert.equal(phase, Phase.ACTIVE);
  },

  assertCloseable: ({ state }) => {
    const { phase } = state;
    assert(
      phase === Phase.ACTIVE || phase === Phase.LIQUIDATED,
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
   * @param {NormalizedDebt} oldDebtNormalized - prior principal and all accrued interest, normalized to the launch of the vaultManager
   * @param {Amount<'nat'>} oldCollateral - actual collateral
   * @param {Amount<'nat'>} newDebtActual - actual principal and all accrued interest
   */
  updateDebtAccounting: (
    { state, facets },
    oldDebtNormalized,
    oldCollateral,
    newDebtActual,
  ) => {
    const { helper } = facets;
    helper.updateDebtSnapshot(newDebtActual);
    // notify manager so it can notify and clean up as appropriate
    state.manager.handleBalanceChange(
      oldDebtNormalized,
      oldCollateral,
      state.idInManager,
      state.phase,
      facets.self,
    );
  },

  /**
   *
   * @param {MethodContext} context
   * @param {ZCFSeat} seat
   */
  getCollateralAllocated: ({ facets }, seat) =>
    seat.getAmountAllocated('Collateral', facets.helper.collateralBrand()),
  getMintedAllocated: ({ facets }, seat) =>
    seat.getAmountAllocated('Minted', facets.helper.debtBrand()),

  assertVaultHoldsNoMinted: ({ state, facets }) => {
    const { vaultSeat } = state;
    assert(
      AmountMath.isEmpty(facets.helper.getMintedAllocated(vaultSeat)),
      X`Vault should be empty of Minted`,
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
      X`Requested ${q(proposedRunDebt)} exceeds max ${q(maxRun)} for ${q(
        collateralAmount,
      )} collateral`,
    );
  },

  /**
   *
   * @param {MethodContext} context
   * @param {HolderPhase} newPhase
   */
  getStateSnapshot: ({ state, facets }, newPhase) => {
    const { debtSnapshot: debt, interestSnapshot: interest } = state;
    /** @type {VaultNotification} */
    return harden({
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
    const ephemera = provideEphemera(state.idInManager);
    const { outerUpdater } = ephemera;
    if (!outerUpdater) {
      // It's not an error to change to liquidating during transfer
      return;
    }
    const { phase } = state;
    const uiState = facets.helper.getStateSnapshot(phase);
    trace('updateUiState', state.idInManager, uiState);

    switch (phase) {
      case Phase.ACTIVE:
      case Phase.LIQUIDATING:
      case Phase.LIQUIDATED:
        outerUpdater.publish(uiState);
        break;
      case Phase.CLOSED:
        outerUpdater.finish(uiState);
        ephemera.outerUpdater = null;
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
    const { zcf } = provideEphemera(state.idInManager);

    // Held as keys for cleanup in the manager
    const oldDebtNormalized = self.getNormalizedDebt();
    const oldCollateral = self.getCollateralAmount();

    if (phase === Phase.ACTIVE) {
      assertProposalShape(seat, {
        give: { Minted: null },
      });

      // you're paying off the debt, you get everything back.
      const debt = self.getCurrentDebt();
      const {
        give: { Minted: given },
      } = seat.getProposal();

      // you must pay off the entire remainder but if you offer too much, we won't
      // take more than you owe
      assert(
        AmountMath.isGTE(given, debt),
        X`Offer ${given} is not sufficient to pay off debt ${debt}`,
      );

      // Return any overpayment
      seat.incrementBy(vaultSeat.decrementBy(vaultSeat.getCurrentAllocation()));
      zcf.reallocate(seat, vaultSeat);
      state.manager.burnAndRecord(debt, seat);
    } else if (phase === Phase.LIQUIDATED) {
      // Simply reallocate vault assets to the offer seat.
      // Don't take anything from the offer, even if vault is underwater.
      // TODO verify that returning Minted here doesn't mess up debt limits
      seat.incrementBy(vaultSeat.decrementBy(vaultSeat.getCurrentAllocation()));
      zcf.reallocate(seat, vaultSeat);
    } else {
      throw new Error('only active and liquidated vaults can be closed');
    }

    seat.exit();
    helper.assignPhase(Phase.CLOSED);
    helper.updateDebtSnapshot(helper.emptyDebt());
    helper.updateUiState();

    helper.assertVaultHoldsNoMinted();
    vaultSeat.exit();

    state.manager.handleBalanceChange(
      oldDebtNormalized,
      oldCollateral,
      state.idInManager,
      state.phase,
      facets.self,
    );

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
  adjustBalancesHook: async ({ state, facets }, clientSeat) => {
    const { self, helper } = facets;
    const ephemera = provideEphemera(state.idInManager);
    const { outerUpdater: updaterPre } = ephemera;
    const { vaultSeat } = state;
    const proposal = clientSeat.getProposal();
    assertOnlyKeys(proposal, ['Collateral', 'Minted']);

    const allEmpty = amounts => {
      return amounts.every(a => AmountMath.isEmpty(a));
    };

    const normalizedDebtPre = self.getNormalizedDebt();
    const collateralPre = helper.getCollateralAllocated(vaultSeat);

    const giveColl = proposal.give.Collateral || helper.emptyCollateral();
    const wantColl = proposal.want.Collateral || helper.emptyCollateral();

    const newCollateralPre = addSubtract(collateralPre, giveColl, wantColl);
    // max debt supported by current Collateral as modified by proposal
    const maxDebtPre = await state.manager.maxDebtFor(newCollateralPre);
    assert(
      updaterPre === ephemera.outerUpdater,
      X`Transfer during vault adjustment`,
    );
    helper.assertActive();

    // After the `await`, we retrieve the vault's allocations again,
    // so we can compare to the debt limit based on the new values.
    const collateral = helper.getCollateralAllocated(vaultSeat);
    const newCollateral = addSubtract(collateral, giveColl, wantColl);

    const debt = self.getCurrentDebt();
    const giveMinted = AmountMath.min(
      proposal.give.Minted || helper.emptyDebt(),
      debt,
    );
    const wantMinted = proposal.want.Minted || helper.emptyDebt();
    if (allEmpty([giveColl, giveMinted, wantColl, wantMinted])) {
      clientSeat.exit();
      return 'no transaction, as requested';
    }

    // Calculate the fee, the amount to mint and the resulting debt. We'll
    // verify that the target debt doesn't violate the collateralization ratio,
    // then mint, reallocate, and burn.
    const { newDebt, fee, toMint } = helper.loanFee(
      debt,
      giveMinted,
      wantMinted,
    );

    trace('adjustBalancesHook', state.idInManager, {
      newCollateralPre,
      newCollateral,
      fee,
      toMint,
      newDebt,
    });

    if (checkRestart(newCollateralPre, maxDebtPre, newCollateral, newDebt)) {
      return helper.adjustBalancesHook(clientSeat);
    }

    stageDelta(clientSeat, vaultSeat, giveColl, wantColl, 'Collateral');
    // `wantMinted` is allocated in the reallocate and mint operation, and so not here
    stageDelta(clientSeat, vaultSeat, giveMinted, helper.emptyDebt(), 'Minted');

    /** @type {Array<ZCFSeat>} */
    const vaultSeatOpt = allEmpty([giveColl, giveMinted, wantColl])
      ? []
      : [vaultSeat];
    state.manager.mintAndReallocate(toMint, fee, clientSeat, ...vaultSeatOpt);

    // parent needs to know about the change in debt
    helper.updateDebtAccounting(normalizedDebtPre, collateralPre, newDebt);
    state.manager.burnAndRecord(giveMinted, vaultSeat);
    helper.assertVaultHoldsNoMinted();

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

    const ephemera = provideEphemera(state.idInManager);

    // eslint-disable-next-line no-use-before-define
    const vaultKit = makeVaultKit(
      self,
      ephemera.storageNode,
      ephemera.marshaller,
      state.manager.getAssetSubscriber(),
    );
    ephemera.outerUpdater = vaultKit.vaultUpdater;
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
   * @param {ERef<StorageNode>} storageNode
   * @param {ERef<Marshaller>} marshaller
   */
  initVaultKit: async ({ state, facets }, seat, storageNode, marshaller) => {
    assert(seat && storageNode && marshaller, 'initVaultKit missing argument');
    const ephemera = provideEphemera(state.idInManager);

    const { self, helper } = facets;

    const normalizedDebtPre = self.getNormalizedDebt();
    const actualDebtPre = self.getCurrentDebt();
    assert(
      AmountMath.isEmpty(normalizedDebtPre) &&
        AmountMath.isEmpty(actualDebtPre),
      X`vault must be empty initially`,
    );

    const collateralPre = self.getCollateralAmount();
    trace('initVaultKit start: collateral', state.idInManager, {
      actualDebtPre,
      collateralPre,
    });

    // get the payout to provide access to the collateral if the
    // contract abandons
    const {
      give: { Collateral: giveCollateral },
      want: { Minted: wantMinted },
    } = seat.getProposal();

    const {
      newDebt: newDebtPre,
      fee,
      toMint,
    } = helper.loanFee(actualDebtPre, helper.emptyDebt(), wantMinted);
    assert(
      !AmountMath.isEmpty(fee),
      X`loan requested (${wantMinted}) is too small; cannot accrue interest`,
    );
    assert(AmountMath.isEqual(newDebtPre, toMint), X`fee mismatch for vault`);
    trace(
      'initVault',
      state.idInManager,
      { wantedRun: wantMinted, fee },
      self.getCollateralAmount(),
    );

    await helper.assertSufficientCollateral(giveCollateral, newDebtPre);

    const { vaultSeat } = state;
    vaultSeat.incrementBy(
      seat.decrementBy(harden({ Collateral: giveCollateral })),
    );
    state.manager.mintAndReallocate(toMint, fee, seat, vaultSeat);
    helper.updateDebtAccounting(normalizedDebtPre, collateralPre, newDebtPre);

    const vaultKit = makeVaultKit(
      self,
      storageNode,
      marshaller,
      state.manager.getAssetSubscriber(),
    );
    ephemera.outerUpdater = vaultKit.vaultUpdater;
    helper.updateUiState();
    return vaultKit;
  },

  /**
   * Called by manager at start of liquidation.
   *
   * @param {MethodContext} context
   */
  liquidating: ({ facets }) => {
    const { helper } = facets;
    helper.assignPhase(Phase.LIQUIDATING);
    helper.updateUiState();
  },

  /**
   * Called by manager at end of liquidation, at which point all debts have been
   * covered.
   *
   * @param {MethodContext} context
   */
  liquidated: ({ facets }) => {
    const { helper } = facets;
    helper.updateDebtSnapshot(
      // liquidated vaults retain no debt
      AmountMath.makeEmpty(helper.debtBrand()),
    );

    helper.assignPhase(Phase.LIQUIDATED);
    helper.updateUiState();
  },

  /**
   * @param {MethodContext} context
   */
  makeAdjustBalancesInvitation: ({ state, facets }) => {
    const { helper } = facets;
    helper.assertActive();
    const { zcf } = provideEphemera(state.idInManager);
    return zcf.makeInvitation(
      seat => helper.adjustBalancesHook(seat),
      'AdjustBalances',
    );
  },

  /**
   * @param {MethodContext} context
   */
  makeCloseInvitation: ({ state, facets }) => {
    const { helper } = facets;
    helper.assertCloseable();
    const { zcf } = provideEphemera(state.idInManager);
    return zcf.makeInvitation(seat => helper.closeHook(seat), 'CloseVault');
  },

  /**
   * @param {MethodContext} context
   * @returns {Promise<Invitation>}
   */
  makeTransferInvitation: ({ state, facets }) => {
    const ephemera = provideEphemera(state.idInManager);
    const { outerUpdater } = ephemera;
    const { self, helper } = facets;
    // Bring the debt snapshot current for the final report before transfer
    helper.updateDebtSnapshot(self.getCurrentDebt());
    const { debtSnapshot: debt, interestSnapshot: interest, phase } = state;
    if (outerUpdater) {
      outerUpdater.finish(helper.getStateSnapshot(Phase.TRANSFER));
      ephemera.outerUpdater = null;
    }
    const transferState = {
      debtSnapshot: { debt, interest },
      locked: self.getCollateralAmount(),
      vaultState: phase,
    };
    const { zcf } = provideEphemera(state.idInManager);
    return zcf.makeInvitation(
      seat => helper.makeTransferInvitationHook(seat),
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
   * @returns {import('./storeUtils.js').NormalizedDebt} as if the vault was open at the launch of this manager, before any interest accrued
   */
  getNormalizedDebt: ({ state }) => {
    // @ts-expect-error cast
    return reverseInterest(state.debtSnapshot, state.interestSnapshot);
  },
};

const makeVaultBase = defineDurableKindMulti(
  makeKindHandle('Vault'),
  initState,
  {
    self: selfBehavior,
    helper: helperBehavior,
  },
);

/**
 * @param {ZCF} zcf
 * @param {VaultManager} manager
 * @param {VaultId} idInManager
 */
export const makeVault = pickFacet(makeVaultBase, 'self');

/** @typedef {ReturnType<typeof makeVault>} Vault */
