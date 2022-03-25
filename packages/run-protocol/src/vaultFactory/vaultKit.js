// @ts-check
import { makeNotifierKit } from '@agoric/notifier';
import '@agoric/zoe/exported.js';
import { Far } from '@endo/marshal';

const { details: X } = assert;

/**
 * @typedef {{
 *   inner: InnerVault | null;
 * }} State
 */
/** @param {InnerVault} innerVault */
const wrapVault = innerVault => {
  /** @type {NotifierRecord<VaultUIState>} */
  const { updater, notifier } = makeNotifierKit();

  /** @type {State} */
  const state = {
    inner: innerVault,
  };

  // Throw if this wrapper no longer owns the inner vault
  const owned = v => {
    const { inner } = state;
    // console.log('OUTER', v, 'INNER', inner);
    assert(inner, X`Using ${v} after transfer`);
    return inner;
  };

  /**
   * Public API of the vault.
   *
   * @see {InnerVault} for the internal API it wraps.
   */
  const vault = Far('vault', {
    getNotifier: () => notifier,
    makeAdjustBalancesInvitation: () =>
      owned(vault).makeAdjustBalancesInvitation(),
    makeCloseInvitation: () => owned(vault).makeCloseInvitation(),
    /**
     * Starting a transfer revokes the outer vault. The associated updater will
     * get a special notification the the vault is being transferred.
     */
    makeTransferInvitation: () => {
      const tmpInner = owned(vault);
      state.inner = null;
      return tmpInner.makeTransferInvitation();
    },
    // for status/debugging
    getCollateralAmount: () => owned(vault).getCollateralAmount(),
    getCurrentDebt: () => owned(vault).getCurrentDebt(),
    getNormalizedDebt: () => owned(vault).getNormalizedDebt(),
  });
  return { vault, vaultUpdater: updater };
};

/**
 * Create a kit of utilities for use of the (inner) vault.
 *
 * @param {InnerVault} inner
 * @param {Notifier<import('./vaultManager').AssetState>} assetNotifier
 */
export const makeVaultKit = (inner, assetNotifier) => {
  const { vault, vaultUpdater } = wrapVault(inner);
  const vaultKit = harden({
    assetNotifier,
    vaultNotifier: vault.getNotifier(),
    invitationMakers: Far('invitation makers', {
      AdjustBalances: vault.makeAdjustBalancesInvitation,
      CloseVault: vault.makeCloseInvitation,
      TransferVault: vault.makeTransferInvitation,
    }),
    vault,
    vaultUpdater,
  });
  return vaultKit;
};

/** @typedef {ReturnType<typeof makeVaultKit>} VaultKit */
