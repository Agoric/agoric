import { q, Fail } from '@endo/errors';
import { AmountMath, AmountShape } from '@agoric/ertp';
import { StorageNodeShape, makeTracer } from '@agoric/internal';
import { UnguardedHelperI } from '@agoric/internal/src/typeGuards.js';
import { M, prepareExoClassKit } from '@agoric/vat-data';
import { atomicTransfer } from '@agoric/zoe/src/contractSupport/index.js';
import { SeatShape } from '@agoric/zoe/src/typeGuards.js';
import {
  addSubtract,
  allEmpty,
  makeNatAmountShape,
} from '../contractSupport.js';
import { calculateCurrentDebt, reverseInterest } from '../interest-math.js';
import { calculateDebtCosts } from './math.js';
import { prepareVaultKit } from './vaultKit.js';

const trace = makeTracer('Vault', true);

/**
 * @import {Brand} from '@agoric/ertp/src/types.js';
 * @import {NormalizedDebt} from './storeUtils.js';
 */

/**
 * @file This has most of the logic for a Vault, to borrow Minted against
 *   collateral.
 *
 *   The logic here is for Vault which is the majority of logic of vaults but the
 *   user view is the `vault` value contained in VaultKit.
 *
 *   A note on naming convention:
 *
 *   - `Pre` is used as a postfix for any mutable value retrieved _before_ an
 *       `await`, to flag values that must used very carefully after the
 *       `await`
 *   - `new` is a prefix for values that describe the result of executing a
 *       transaction; e.g., `debt` is the value before the txn, and `newDebt`
 *       will be value if the txn completes.
 *   - the absence of one of these implies the opposite, so `newDebt` is the future
 *       value fo `debt`, as computed based on values after any `await`
 */

/**
 * Constants for vault phase.
 *
 * - ACTIVE - vault is in use and can be changed
 * - LIQUIDATING - vault is being liquidated by the vault manager, and cannot be
 *   changed by the user. If liquidation fails, vaults may remain in this state.
 *   An upgrade to the contract might be able to recover them.
 * - TRANSFER - vault is able to be transferred (payments and debits frozen until
 *   it has a new owner)
 * - CLOSED - vault was closed by the user and all assets have been paid out
 * - LIQUIDATED - vault was closed by the manager, with remaining assets paid to
 *   owner
 *
 * @enum {(typeof Phase)[keyof typeof Phase]}
 */
export const Phase = /** @type {const} */ ({
  ACTIVE: 'active',
  LIQUIDATING: 'liquidating',
  CLOSED: 'closed',
  LIQUIDATED: 'liquidated',
  TRANSFER: 'transfer',
});
harden(Phase);

/**
 * @typedef {Exclude<Phase, 'transfer'>} VaultPhase
 * @type {{ [K in VaultPhase]: VaultPhase[] }}
 */
const validTransitions = {
  [Phase.ACTIVE]: [Phase.LIQUIDATING, Phase.CLOSED],
  [Phase.LIQUIDATING]: [Phase.LIQUIDATED, Phase.ACTIVE],
  [Phase.LIQUIDATED]: [Phase.CLOSED],
  [Phase.CLOSED]: [],
};

/**
 * @typedef {object} VaultNotification
 * @property {Amount<'nat'>} locked Amount of Collateral locked
 * @property {{ debt: Amount<'nat'>; interest: Ratio }} debtSnapshot 'debt' at
 *   the point the compounded interest was 'interest'
 * @property {Phase} vaultState
 */

// XXX masks typedef from types.js, but using that causes circular def problems
/**
 * @typedef {object} VaultManager
 * @property {() => Subscriber<import('./vaultManager.js').AssetState>} getAssetSubscriber
 * @property {(collateralAmount: Amount) => Amount<'nat'>} maxDebtFor
 * @property {() => Brand<'nat'>} getCollateralBrand
 * @property {(base: string) => string} scopeDescription
 * @property {() => Brand<'nat'>} getDebtBrand
 * @property {MintAndTransfer} mintAndTransfer
 * @property {(amount: Amount, seat: ZCFSeat) => void} burn
 * @property {() => Ratio} getCompoundedInterest
 * @property {(
 *   oldDebt: import('./storeUtils.js').NormalizedDebt,
 *   oldCollateral: Amount<'nat'>,
 *   vaultId: VaultId,
 *   vaultPhase: VaultPhase,
 *   vault: Vault,
 * ) => void} handleBalanceChange
 * @property {() => import('./vaultManager.js').GovernedParamGetters} getGovernedParams
 */

/**
 * @typedef {Readonly<{
 *   idInManager: VaultId;
 *   manager: VaultManager;
 *   storageNode: StorageNode;
 *   vaultSeat: ZCFSeat;
 * }>} ImmutableState
 */

/**
 * Snapshot is of the debt and compounded interest when the principal was last
 * changed.
 *
 * @typedef {{
 *   interestSnapshot: Ratio;
 *   phase: VaultPhase;
 *   debtSnapshot: Amount<'nat'>;
 *   outerUpdater:
 *     | import('@agoric/zoe/src/contractSupport/recorder.js').Recorder<VaultNotification>
 *     | null;
 * }} MutableState
 */

export const VaultI = M.interface('Vault', {
  getCollateralAmount: M.call().returns(AmountShape),
  getCurrentDebt: M.call().returns(AmountShape),
  getNormalizedDebt: M.call().returns(AmountShape),
  getVaultSeat: M.call().returns(SeatShape),
  initVaultKit: M.call(SeatShape, StorageNodeShape).returns(M.promise()),
  liquidated: M.call().returns(undefined),
  liquidating: M.call().returns(undefined),
  makeAdjustBalancesInvitation: M.call().returns(M.promise()),
  makeCloseInvitation: M.call().returns(M.promise()),
  makeTransferInvitation: M.call().returns(M.promise()),
  abortLiquidation: M.call().returns(M.string()),
});

const VaultStateShape = harden({
  idInManager: M.any(),
  manager: M.any(),
  outerUpdater: M.any(),
  phase: M.any(),
  storageNode: M.any(),
  vaultSeat: M.any(),
  interestSnapshot: M.any(),
  debtSnapshot: M.any(),
});

/**
 * @param {import('@agoric/swingset-liveslots').Baggage} baggage
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorderKit} makeRecorderKit
 * @param {ZCF} zcf
 */
export const prepareVault = (baggage, makeRecorderKit, zcf) => {
  const makeVaultKit = prepareVaultKit(baggage, makeRecorderKit);

  const maker = prepareExoClassKit(
    baggage,
    'Vault',
    {
      helper: UnguardedHelperI,
      self: VaultI,
    },
    /**
     * @param {VaultManager} manager
     * @param {VaultId} idInManager
     * @param {StorageNode} storageNode
     * @returns {ImmutableState & MutableState}
     */
    (manager, idInManager, storageNode) => {
      return harden({
        idInManager,
        manager,
        outerUpdater: null,
        phase: Phase.ACTIVE,

        storageNode,

        // vaultSeat will hold the collateral until the position is retired. The
        // payout from it will be handed to the user: if the vault dies early
        // (because the vaultFactory vat died), they'll get all their
        // collateral back. If that happens, the issuer for the Minted will be dead,
        // so their position will be worthless.
        vaultSeat: zcf.makeEmptySeatKit().zcfSeat,

        // Two values from the same moment
        interestSnapshot: manager.getCompoundedInterest(),
        debtSnapshot: AmountMath.makeEmpty(manager.getDebtBrand()),
      });
    },
    {
      helper: {
        //#region Computed constants
        collateralBrand() {
          return this.state.manager.getCollateralBrand();
        },
        debtBrand() {
          return this.state.manager.getDebtBrand();
        },

        emptyCollateral() {
          return AmountMath.makeEmpty(this.facets.helper.collateralBrand());
        },
        emptyDebt() {
          return AmountMath.makeEmpty(this.facets.helper.debtBrand());
        },
        /**
         * @typedef {{
         *   give: { Collateral: Amount<'nat'>; Minted: Amount<'nat'> };
         *   want: { Collateral: Amount<'nat'>; Minted: Amount<'nat'> };
         * }} FullProposal
         */
        /**
         * @param {ProposalRecord} partial
         * @returns {FullProposal}
         */
        fullProposal(partial) {
          return {
            give: {
              Collateral:
                partial.give?.Collateral ||
                this.facets.helper.emptyCollateral(),
              Minted: partial.give?.Minted || this.facets.helper.emptyDebt(),
            },
            want: {
              Collateral:
                partial.want?.Collateral ||
                this.facets.helper.emptyCollateral(),
              Minted: partial.want?.Minted || this.facets.helper.emptyDebt(),
            },
          };
        },
        //#endregion

        //#region Phase logic
        /** @param {VaultPhase} newPhase */
        assignPhase(newPhase) {
          const { state } = this;

          const { phase } = state;
          const validNewPhases = validTransitions[phase];
          validNewPhases.includes(newPhase) ||
            Fail`Vault cannot transition from ${q(phase)} to ${q(newPhase)}`;
          state.phase = newPhase;
        },

        assertActive() {
          const { phase } = this.state;
          phase === Phase.ACTIVE || Fail`vault not active`;
        },

        assertCloseable() {
          const { phase } = this.state;
          phase === Phase.ACTIVE ||
            phase === Phase.LIQUIDATED ||
            Fail`to be closed a vault must be active or liquidated, not ${phase}`;
        },
        //#endregion

        /**
         * Called whenever the debt is paid or created through a transaction,
         * but not for interest accrual.
         *
         * @param {Amount<'nat'>} newDebt - principal and all accrued interest
         */
        updateDebtSnapshot(newDebt) {
          const { state } = this;

          // update local state
          state.debtSnapshot = newDebt;
          state.interestSnapshot = state.manager.getCompoundedInterest();
        },

        /**
         * Update the debt balance and propagate upwards to maintain aggregate
         * debt and liquidation order.
         *
         * @param {NormalizedDebt} oldDebtNormalized - prior principal and all
         *   accrued interest, normalized to the launch of the vaultManager
         * @param {Amount<'nat'>} oldCollateral - actual collateral
         * @param {Amount<'nat'>} newDebtActual - actual principal and all
         *   accrued interest
         */
        updateDebtAccounting(oldDebtNormalized, oldCollateral, newDebtActual) {
          const { state, facets } = this;
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
         * @param {ZCFSeat} seat
         * @returns {Amount<'nat'>}
         */
        getCollateralAllocated(seat) {
          return seat.getAmountAllocated(
            'Collateral',
            this.facets.helper.collateralBrand(),
          );
        },
        /**
         * @param {ZCFSeat} seat
         * @returns {Amount<'nat'>}
         */
        getMintedAllocated(seat) {
          return seat.getAmountAllocated(
            'Minted',
            this.facets.helper.debtBrand(),
          );
        },

        assertVaultHoldsNoMinted() {
          const { state, facets } = this;
          const { vaultSeat } = state;
          AmountMath.isEmpty(facets.helper.getMintedAllocated(vaultSeat)) ||
            Fail`Vault should be empty of Minted`;
        },

        /**
         * @param {Amount<'nat'>} collateralAmount
         * @param {Amount<'nat'>} proposedDebt
         */
        assertSufficientCollateral(collateralAmount, proposedDebt) {
          const { state, facets } = this;
          const maxDebt = state.manager.maxDebtFor(collateralAmount);
          AmountMath.isGTE(maxDebt, proposedDebt, facets.helper.debtBrand()) ||
            Fail`Proposed debt ${q(proposedDebt)} exceeds max ${q(
              maxDebt,
            )} for ${q(collateralAmount)} collateral`;
        },

        /** @param {Phase} newPhase */
        getStateSnapshot(newPhase) {
          const { state, facets } = this;

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

        /** call this whenever anything changes! */
        updateUiState() {
          const { state, facets } = this;
          const { outerUpdater } = state;
          if (!outerUpdater) {
            // It's not an error to change to liquidating during transfer
            return;
          }
          const { phase } = state;
          const uiState = facets.helper.getStateSnapshot(phase);
          const brand = facets.helper.collateralBrand();
          trace(brand, 'updateUiState', state.idInManager, uiState);

          switch (phase) {
            case Phase.ACTIVE:
            case Phase.LIQUIDATING:
            case Phase.LIQUIDATED:
              void outerUpdater.write(uiState);
              break;
            case Phase.CLOSED:
              void outerUpdater.writeFinal(uiState);
              state.outerUpdater = null;
              break;
            default:
              throw Error(`unreachable vault phase: ${phase}`);
          }
        },

        /** @param {ZCFSeat} seat */
        async closeHook(seat) {
          const { state, facets } = this;

          const { self, helper } = facets;
          helper.assertCloseable();
          const { phase, vaultSeat } = state;

          // Held as keys for cleanup in the manager
          const oldDebtNormalized = self.getNormalizedDebt();
          const oldCollateral = self.getCollateralAmount();

          if (phase === Phase.ACTIVE) {
            // you're paying off the debt, you get everything back.
            const debt = self.getCurrentDebt();
            const {
              give: { Minted: given },
            } = seat.getProposal();
            given || Fail`closing an active vault requires a give`;

            // you must pay off the entire remainder but if you offer too much, we won't
            // take more than you owe
            AmountMath.isGTE(given, debt) ||
              Fail`Offer ${q(given)} is not sufficient to pay off debt ${q(
                debt,
              )}`;

            // Return any overpayment
            atomicTransfer(
              zcf,
              vaultSeat,
              seat,
              vaultSeat.getCurrentAllocation(),
            );

            state.manager.burn(debt, seat);
          } else if (phase === Phase.LIQUIDATED) {
            // Simply reallocate vault assets to the offer seat.
            // Don't take anything from the offer, even if vault is underwater.
            // TODO verify that returning Minted here doesn't mess up debt limits

            atomicTransfer(
              zcf,
              vaultSeat,
              seat,
              vaultSeat.getCurrentAllocation(),
            );
          } else {
            throw Error('only active and liquidated vaults can be closed');
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

          return 'your vault is closed, thank you for your business';
        },

        /**
         * Calculate the fee, the amount to mint and the resulting debt. The
         * give and the want together reflect a delta, where typically one is
         * zero because they come from the gave/want of an offer proposal. If
         * the `want` is zero, the `fee` will also be zero, so the simple math
         * works.
         *
         * @param {Amount<'nat'>} currentDebt
         * @param {Amount<'nat'>} giveAmount
         * @param {Amount<'nat'>} wantAmount
         */
        debtFee(currentDebt, giveAmount, wantAmount) {
          const { state } = this;

          return calculateDebtCosts(
            currentDebt,
            giveAmount,
            wantAmount,
            state.manager.getGovernedParams().getMintFee(),
          );
        },

        /**
         * Adjust principal and collateral (atomically for offer safety)
         *
         * @param {ZCFSeat} clientSeat
         * @returns {string} success message
         */
        adjustBalancesHook(clientSeat) {
          const { state, facets } = this;

          const { self, helper } = facets;
          const { vaultSeat } = state;
          const fp = helper.fullProposal(clientSeat.getProposal());

          if (
            allEmpty([
              fp.give.Collateral,
              fp.give.Minted,
              fp.want.Collateral,
              fp.want.Minted,
            ])
          ) {
            clientSeat.exit();
            return 'no transaction, as requested';
          }

          // Calculate the fee, the amount to mint and the resulting debt. We'll
          // verify that the target debt doesn't violate the collateralization ratio,
          // then mint, reallocate, and burn.
          const { newDebt, fee, surplus, toMint } = helper.debtFee(
            self.getCurrentDebt(),
            fp.give.Minted,
            fp.want.Minted,
          );

          const normalizedDebtPre = self.getNormalizedDebt();
          const collateralPre = helper.getCollateralAllocated(vaultSeat);

          const hasWants = !allEmpty([fp.want.Collateral, fp.want.Minted]);
          if (hasWants) {
            const newCollateral = addSubtract(
              collateralPre,
              fp.give.Collateral,
              fp.want.Collateral,
            );
            helper.assertSufficientCollateral(newCollateral, newDebt);
          }

          return helper.commitBalanceAdjustment(
            clientSeat,
            fp,
            {
              newDebt,
              fee,
              surplus,
              toMint,
            },
            { normalizedDebtPre, collateralPre },
          );
        },

        /**
         * @param {ZCFSeat} clientSeat
         * @param {FullProposal} fp
         * @param {ReturnType<typeof calculateDebtCosts>} costs
         * @param {object} accounting
         * @param {NormalizedDebt} accounting.normalizedDebtPre
         * @param {Amount<'nat'>} accounting.collateralPre
         * @returns {string} success message
         */
        commitBalanceAdjustment(
          clientSeat,
          fp,
          { newDebt, fee, surplus, toMint },
          { normalizedDebtPre, collateralPre },
        ) {
          const { state, facets } = this;
          const { helper } = facets;
          const { vaultSeat } = state;

          const giveMintedTaken = AmountMath.subtract(fp.give.Minted, surplus);

          /** @type {TransferPart[]} */
          const transfers = harden([
            [clientSeat, vaultSeat, { Collateral: fp.give.Collateral }],
            [vaultSeat, clientSeat, { Collateral: fp.want.Collateral }],
            [clientSeat, vaultSeat, { Minted: giveMintedTaken }],
            // Minted into vaultSeat requires minting and so is done by mintAndTransfer
          ]);

          state.manager.mintAndTransfer(clientSeat, toMint, fee, transfers);

          // parent needs to know about the change in debt
          helper.updateDebtAccounting(
            normalizedDebtPre,
            collateralPre,
            newDebt,
          );
          state.manager.burn(giveMintedTaken, vaultSeat);
          helper.assertVaultHoldsNoMinted();

          helper.updateUiState();
          clientSeat.exit();
          return 'We have adjusted your balances, thank you for your business';
        },

        /**
         * @param {ZCFSeat} seat
         * @returns {VaultKit}
         */
        makeTransferInvitationHook(seat) {
          const { state, facets } = this;

          const { self, helper } = facets;
          helper.assertCloseable();
          seat.exit();

          const vaultKit = makeVaultKit(self, state.storageNode);
          state.outerUpdater = vaultKit.vaultUpdater;
          helper.updateUiState();

          return vaultKit;
        },
      },
      self: {
        getVaultSeat() {
          return this.state.vaultSeat;
        },

        /**
         * @param {ZCFSeat} seat
         * @param {StorageNode} storageNode
         */
        async initVaultKit(seat, storageNode) {
          const { state, facets } = this;

          const { self, helper } = facets;

          const normalizedDebtPre = self.getNormalizedDebt();
          const actualDebtPre = self.getCurrentDebt();
          (AmountMath.isEmpty(normalizedDebtPre) &&
            AmountMath.isEmpty(actualDebtPre)) ||
            Fail`vault must be empty initially`;

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

          const minInitialDebt = state.manager
            .getGovernedParams()
            .getMinInitialDebt();
          AmountMath.isGTE(wantMinted, minInitialDebt) ||
            Fail`Vault creation requires a minInitialDebt of ${q(
              minInitialDebt,
            )}`;

          const {
            newDebt: newDebtPre,
            fee,
            toMint,
          } = helper.debtFee(actualDebtPre, helper.emptyDebt(), wantMinted);
          !AmountMath.isEmpty(fee) ||
            Fail`debt requested (${wantMinted}) too small to accrue interest`;
          AmountMath.isEqual(newDebtPre, toMint) ||
            Fail`fee mismatch for vault`;
          trace(
            'initVault',
            state.idInManager,
            { wantedRun: wantMinted, fee },
            self.getCollateralAmount(),
          );

          helper.assertSufficientCollateral(giveCollateral, newDebtPre);

          const { vaultSeat } = state;
          state.manager.mintAndTransfer(
            seat,
            toMint,
            fee,
            harden([[seat, vaultSeat, { Collateral: giveCollateral }]]),
          );
          seat.exit();

          helper.updateDebtAccounting(
            normalizedDebtPre,
            collateralPre,
            newDebtPre,
          );
          trace('initVault updateDebtAccounting fired');

          // So that makeVaultKit can be synchronous
          const vaultKit = makeVaultKit(self, storageNode);
          state.outerUpdater = vaultKit.vaultUpdater;
          helper.updateUiState();
          return vaultKit;
        },

        /** Called by manager at start of liquidation. */
        liquidating() {
          const { facets } = this;

          const { helper } = facets;
          helper.assignPhase(Phase.LIQUIDATING);
          helper.updateUiState();
        },

        /**
         * Called by manager at end of liquidation, at which point all debts
         * have been covered.
         */
        liquidated() {
          const { facets } = this;

          const { helper } = facets;
          helper.updateDebtSnapshot(
            // liquidated vaults retain no debt
            AmountMath.makeEmpty(helper.debtBrand()),
          );

          helper.assignPhase(Phase.LIQUIDATED);
          helper.updateUiState();
        },

        /**
         * Called by vaultManager when the auction wasn't able to sell the
         * collateral. The liquidation fee was charged against the collateral,
         * but the debt will be restored and the vault will be active again.
         * Liquidation.md has details on the liquidation approach.
         */
        abortLiquidation() {
          const { state, facets } = this;

          const { helper } = facets;

          helper.assignPhase(Phase.ACTIVE);
          helper.updateUiState();
          return state.idInManager;
        },

        makeAdjustBalancesInvitation() {
          const { state, facets } = this;
          const { helper } = facets;
          helper.assertActive();

          return zcf.makeInvitation(
            seat => helper.adjustBalancesHook(seat),
            state.manager.scopeDescription('AdjustBalances'),
            undefined,
            M.splitRecord({
              give: M.splitRecord(
                {},
                {
                  // It may seem odd to give both at once but there is use case:
                  // To rescue a vault that's on the verge of being liquidated
                  // when you have limited resources, you might add collateral
                  // at the same time that you're repaying IST.
                  Collateral: makeNatAmountShape(helper.collateralBrand()),
                  Minted: makeNatAmountShape(helper.debtBrand()),
                },
                {},
              ),
              want: M.splitRecord(
                {},
                {
                  Collateral: makeNatAmountShape(helper.collateralBrand()),
                  Minted: makeNatAmountShape(helper.debtBrand()),
                },
                {},
              ),
            }),
          );
        },

        makeCloseInvitation() {
          const { state, facets } = this;
          const { helper } = facets;
          helper.assertCloseable();
          return zcf.makeInvitation(
            async seat => helper.closeHook(seat),
            state.manager.scopeDescription('CloseVault'),
            undefined,
            M.splitRecord({
              give: M.splitRecord(
                {},
                {
                  Minted: makeNatAmountShape(helper.debtBrand()),
                },
                {},
              ),
              want: M.splitRecord(
                {},
                {
                  Collateral: makeNatAmountShape(helper.collateralBrand()),
                },
                {},
              ),
            }),
          );
        },

        /** @returns {Promise<Invitation<VaultKit>>} */
        makeTransferInvitation() {
          const { state, facets } = this;
          const { outerUpdater } = state;
          const { self, helper } = facets;
          // Bring the debt snapshot current for the final report before transfer
          helper.updateDebtSnapshot(self.getCurrentDebt());
          const {
            debtSnapshot: debt,
            interestSnapshot: interest,
            phase,
          } = state;
          if (outerUpdater) {
            void outerUpdater.writeFinal(
              helper.getStateSnapshot(Phase.TRANSFER),
            );
            state.outerUpdater = null;
          }
          const transferState = {
            debtSnapshot: { debt, interest },
            locked: self.getCollateralAmount(),
            vaultState: phase,
          };
          return zcf.makeInvitation(
            seat => helper.makeTransferInvitationHook(seat),
            state.manager.scopeDescription('TransferVault'),
            transferState,
          );
        },

        // for status/debugging

        /** @returns {Amount<'nat'>} */
        getCollateralAmount() {
          const { state, facets } = this;
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
         * This looks like a simple getter but it does a lot of the heavy
         * lifting for interest accrual. Rather than updating all records when
         * interest accrues, the vault manager updates just its rolling
         * compounded interest. Here we calculate what the current debt is given
         * what's recorded in this vault and what interest has compounded since
         * this vault record was written.
         *
         * @returns {Amount<'nat'>}
         * @see getNormalizedDebt
         */
        getCurrentDebt() {
          const { state } = this;
          return calculateCurrentDebt(
            state.debtSnapshot,
            state.interestSnapshot,
            state.manager.getCompoundedInterest(),
          );
        },

        /**
         * The normalization puts all debts on a common time-independent scale
         * since the launch of this vault manager. This allows the manager to
         * order vaults by their debt-to-collateral ratios without having to
         * mutate the debts as the interest accrues.
         *
         * @returns {import('./storeUtils.js').NormalizedDebt} as if the vault
         *   was open at the launch of this manager, before any interest
         *   accrued
         * @see getActualDebAmount
         */
        getNormalizedDebt() {
          const { state } = this;
          // @ts-expect-error cast
          return reverseInterest(state.debtSnapshot, state.interestSnapshot);
        },
      },
    },
    {
      stateShape: VaultStateShape,
    },
  );
  return maker;
};

/** @typedef {ReturnType<ReturnType<typeof prepareVault>>['self']} Vault */
