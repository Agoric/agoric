// @ts-check
// @jessie-check
import { AmountMath, AssetKind } from '@agoric/ertp';
import { assertProposalShape } from '@agoric/zoe/src/contractSupport/index.js';
import { ceilMultiplyBy } from '@agoric/zoe/src/contractSupport/ratio.js';
import { makeNotifierKit } from '@agoric/notifier';
import { M, matches } from '@agoric/store';
import { makeTracer } from '../makeTracer.js';
import { addSubtract, assertOnlyKeys, stageDelta } from '../contractSupport.js';
import { calculateCurrentDebt, reverseInterest } from '../interest-math.js';
import { KW as AttKW } from './attestation.js';

const { details: X, quote: q } = assert;

const trace = makeTracer('R1');

export const KW = /** @type { const } */ ({
  [AttKW.Attestation]: AttKW.Attestation,
  Debt: 'Debt',
});

/**
 * Calculate the fee, the amount to mint and the resulting debt.
 *
 * @param {Ratio} feeCoeff fee coefficient
 * @param {Amount} currentDebt
 * @param {Amount} giveAmount
 * @param {Amount} wantAmount
 */
const calculateFee = (feeCoeff, currentDebt, giveAmount, wantAmount) => {
  const fee = ceilMultiplyBy(wantAmount, feeCoeff);
  const toMint = AmountMath.add(wantAmount, fee);
  const newDebt = addSubtract(currentDebt, toMint, giveAmount);
  return { newDebt, toMint, fee };
};

/**
 * @typedef {Readonly<{
 *   collateralBrand: Brand,
 *   debtBrand: Brand,
 *   manager: import('./runStakeManager.js').RunStakeManager,
 *   notifier: NotifierRecord<unknown>['notifier'],
 *   vaultSeat: ZCFSeat,
 *   zcf: ZCF,
 * }>} ImmutableState
 * @typedef {{
 *   open: boolean,
 *   debtSnapshot: Amount<'nat'>,
 *   interestSnapshot: Ratio,
 *   updater: NotifierRecord<unknown>['updater'] | null,
 * }} MutableState
 * @typedef {MutableState & ImmutableState} State
 */

/**
 * Make RUNstake kit state
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} startSeat
 * @param {import('./runStakeManager.js').RunStakeManager} manager
 * @returns {State}
 */
const initState = (zcf, startSeat, manager) => {
  const collateralBrand = manager.getCollateralBrand();
  const debtBrand = manager.getDebtBrand();

  const { zcfSeat: vaultSeat } = zcf.makeEmptySeatKit();

  const emptyDebt = AmountMath.makeEmpty(debtBrand);

  const initialDebt = (() => {
    assertProposalShape(startSeat, {
      give: { [KW.Attestation]: null },
      want: { [KW.Debt]: null },
    });
    const {
      give: { [KW.Attestation]: attestationGiven },
      want: { [KW.Debt]: runWanted },
    } = startSeat.getProposal();

    const { maxDebt } = manager.maxDebtForLien(attestationGiven);
    assert(
      AmountMath.isGTE(maxDebt, runWanted),
      X`wanted ${runWanted}, more than max debt (${maxDebt}) for ${attestationGiven}`,
    );

    const { newDebt, fee, toMint } = calculateFee(
      manager.getLoanFee(),
      emptyDebt,
      emptyDebt,
      runWanted,
    );
    assert(
      !AmountMath.isEmpty(fee),
      X`loan requested (${runWanted}) is too small; cannot accrue interest`,
    );
    assert(AmountMath.isEqual(newDebt, toMint), X`loan fee mismatch`);
    trace('init', { runWanted, fee, attestationGiven });

    vaultSeat.incrementBy(
      startSeat.decrementBy(harden({ [KW.Attestation]: attestationGiven })),
    );

    manager.mintAndReallocate(toMint, fee, startSeat, vaultSeat);

    startSeat.exit();
    return newDebt;
  })();
  manager.applyDebtDelta(emptyDebt, initialDebt);

  const { notifier, updater } = makeNotifierKit();

  /** @type {ImmutableState} */
  const immutable = {
    collateralBrand,
    debtBrand,
    manager,
    notifier,
    vaultSeat,
    zcf,
  };
  return {
    ...immutable,
    open: true,
    // Two values from the same moment
    interestSnapshot: manager.getCompoundedInterest(),
    debtSnapshot: initialDebt,
    updater,
  };
};

/**
 * Make RUNstake kit, subject to runStake terms.
 *
 * @param {ZCF} zcf
 * @param {ZCFSeat} startSeat
 * @param {import('./runStakeManager.js').RunStakeManager} manager
 * @throws {Error} if startSeat proposal is not consistent with governance parameters in manager
 */
export const makeRunStakeKit = (zcf, startSeat, manager) => {
  const state = initState(zcf, startSeat, manager);
  const { collateralBrand, debtBrand, vaultSeat } = state;

  const helper = {
    getCollateralAllocated: seat =>
      seat.getAmountAllocated(KW.Attestation, collateralBrand),
    getRunAllocated: seat => seat.getAmountAllocated(KW.Debt, debtBrand),
    getCollateralAmount: () => {
      const emptyCollateral = AmountMath.makeEmpty(
        collateralBrand,
        AssetKind.COPY_BAG,
      );
      // getCollateralAllocated would return final allocations
      return vaultSeat.hasExited()
        ? emptyCollateral
        : helper.getCollateralAllocated(vaultSeat);
    },

    /** @param {boolean} newActive */
    snapshotState: newActive => {
      const { debtSnapshot: debt, interestSnapshot: interest } = state;
      /** @type {VaultUIState} */
      const result = harden({
        // TODO move manager state to a separate notifer https://github.com/Agoric/agoric-sdk/issues/4540
        interestRate: manager.getInterestRate(),
        liquidationRatio: manager.getMintingRatio(),
        debtSnapshot: { debt, interest },
        locked: helper.getCollateralAmount(),
        // newPhase param is so that makeTransferInvitation can finish without setting the vault's phase
        // TODO refactor https://github.com/Agoric/agoric-sdk/issues/4415
        vaultState: newActive ? 'active' : 'closed',
      });
      return result;
    },

    /** call this whenever anything changes! */
    updateUiState: async () => {
      const { open: active, updater } = state;
      if (!updater) {
        console.warn('updateUiState called after ui.updater removed');
        return;
      }
      const uiState = helper.snapshotState(active);
      trace('updateUiState', uiState);

      if (active) {
        updater.updateState(uiState);
      } else {
        updater.finish(uiState);
        state.updater = null;
      }
    },

    /**
     * Called whenever the debt is paid or created through a transaction,
     * but not for interest accrual.
     *
     * @param {Amount} newDebt - principal and all accrued interest
     */
    updateDebtSnapshot: newDebt => {
      // update local state
      state.debtSnapshot = newDebt;
      state.interestSnapshot = manager.getCompoundedInterest();
    },

    /**
     * Update the debt balance and propagate upwards to
     * maintain aggregate debt and liquidation order.
     *
     * @param {Amount} oldDebt - prior principal and all accrued interest
     * @param {Amount} newDebt - actual principal and all accrued interest
     */
    updateDebtAccounting: (oldDebt, newDebt) => {
      helper.updateDebtSnapshot(newDebt);
      // update vault manager which tracks total debt
      manager.applyDebtDelta(oldDebt, newDebt);
    },

    assertVaultHoldsNoRun: () => {
      assert(
        AmountMath.isEmpty(helper.getRunAllocated(vaultSeat)),
        X`Vault should be empty of debt`,
      );
    },

    /**
     * Adjust principal and collateral (atomically for offer safety)
     *
     * @param {ZCFSeat} clientSeat
     */
    handleAdjustBalancesOffer: clientSeat => {
      assert(state.open);

      const proposal = clientSeat.getProposal();
      assertOnlyKeys(proposal, [KW.Attestation, KW.Debt]);

      // eslint-disable-next-line no-use-before-define
      const debt = pot.getCurrentDebt();
      const collateral = helper.getCollateralAllocated(vaultSeat);

      const emptyCollateral = AmountMath.makeEmpty(
        collateralBrand,
        AssetKind.COPY_BAG,
      );
      const giveColl = proposal.give.Attestation || emptyCollateral;
      const wantColl = proposal.want.Attestation || emptyCollateral;

      // new = after the transaction gets applied
      const newCollateral = addSubtract(collateral, giveColl, wantColl);
      // max debt supported by current Collateral as modified by proposal
      const { amountLiened, maxDebt: newMaxDebt } =
        manager.maxDebtForLien(newCollateral);

      const emptyDebt = AmountMath.makeEmpty(debtBrand);
      const giveRUN = AmountMath.min(proposal.give.Debt || emptyDebt, debt);
      const wantRUN = proposal.want.Debt || emptyDebt;
      const giveRUNonly = matches(
        proposal,
        harden({ give: { [KW.Debt]: M.record() }, want: {}, exit: M.any() }),
      );

      // Calculate the fee, the amount to mint and the resulting debt. We'll
      // verify that the target debt doesn't violate the collateralization ratio,
      // then mint, reallocate, and burn.
      const { newDebt, fee, toMint } = calculateFee(
        manager.getLoanFee(),
        debt,
        giveRUN,
        wantRUN,
      );
      assert(
        giveRUNonly || AmountMath.isGTE(newMaxDebt, newDebt),
        `cannot borrow ${q(newDebt)} against ${q(amountLiened)}; max is ${q(
          newMaxDebt,
        )}`,
      );

      trace('adjustBalancesHook', {
        targetCollateralAmount: newCollateral,
        vaultCollateral: newCollateral,
        fee,
        toMint,
        newDebt,
      });

      stageDelta(clientSeat, vaultSeat, giveColl, wantColl, KW.Attestation);
      stageDelta(clientSeat, vaultSeat, giveRUN, emptyDebt, KW.Debt);
      manager.mintAndReallocate(toMint, fee, clientSeat, vaultSeat);

      // parent needs to know about the change in debt
      helper.updateDebtAccounting(debt, newDebt);

      manager.burnDebt(giveRUN, vaultSeat);

      helper.assertVaultHoldsNoRun();

      helper.updateUiState();
      clientSeat.exit();

      return 'We have adjusted your balances; thank you for your business.';
    },

    /**
     * Given sufficient RUN payoff, refund the attestation.
     *
     * @param {ZCFSeat} seat
     */
    handleCloseOffer: seat => {
      assert(state.open);
      assertProposalShape(seat, {
        give: { [KW.Debt]: null },
        want: { [KW.Attestation]: null },
      });

      // eslint-disable-next-line no-use-before-define
      const currentDebt = pot.getCurrentDebt();
      const {
        give: { [KW.Debt]: runOffered },
      } = seat.getProposal();
      assert(
        AmountMath.isGTE(runOffered, currentDebt),
        X`Offer ${runOffered} is not sufficient to pay off debt ${currentDebt}`,
      );
      vaultSeat.incrementBy(
        seat.decrementBy(harden({ [KW.Debt]: currentDebt })),
      );
      seat.incrementBy(
        vaultSeat.decrementBy(
          harden({ Attestation: vaultSeat.getAmountAllocated('Attestation') }),
        ),
      );

      zcf.reallocate(seat, vaultSeat);

      manager.burnDebt(currentDebt, vaultSeat);
      state.open = false;
      helper.updateDebtSnapshot(AmountMath.makeEmpty(debtBrand));
      helper.updateUiState();
      helper.assertVaultHoldsNoRun();
      seat.exit();

      return 'Your RUNstake is closed; thank you for your business.';
    },
  };

  const pot = {
    getNotifier: () => state.notifier,
    makeAdjustBalancesInvitation: () => {
      assert(state.open);
      return zcf.makeInvitation(
        helper.handleAdjustBalancesOffer,
        'AdjustBalances',
      );
    },
    makeCloseInvitation: () => {
      assert(state.open);
      return zcf.makeInvitation(helper.handleCloseOffer, 'CloseVault');
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
     * @returns {Amount<'nat'>}
     */
    getCurrentDebt: () => {
      return calculateCurrentDebt(
        state.debtSnapshot,
        state.interestSnapshot,
        manager.getCompoundedInterest(),
      );
    },
    getNormalizedDebt: () =>
      reverseInterest(state.debtSnapshot, state.interestSnapshot),
  };

  helper.updateUiState();

  return { helper, pot };
};
