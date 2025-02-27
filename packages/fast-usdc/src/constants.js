/**
 * Status values for FastUSDC. Includes states for advancing and settling.
 *
 * @enum {(typeof TxStatus)[keyof typeof TxStatus]}
 */
export const TxStatus = /** @type {const} */ ({
  /** tx was observed but not advanced */
  Observed: 'OBSERVED',
  /** IBC transfer is initiated */
  Advancing: 'ADVANCING',
  /** IBC transfer is complete */
  Advanced: 'ADVANCED',
  /** IBC transfer failed (timed out) */
  AdvanceFailed: 'ADVANCE_FAILED',
  /** Advance skipped and waiting for forward */
  AdvanceSkipped: 'ADVANCE_SKIPPED',
  /** settlement for matching advance received and funds disbursed */
  Disbursed: 'DISBURSED',
  /** fallback: do not collect fees */
  Forwarded: 'FORWARDED',
  /** failed to forward to EUD */
  ForwardFailed: 'FORWARD_FAILED',
});
harden(TxStatus);

// According to the state diagram
export const TerminalTxStatus = {
  [TxStatus.Forwarded]: true,
  [TxStatus.ForwardFailed]: true,
  [TxStatus.Disbursed]: true,
};

/**
 * Status values for the StatusManager while an advance is being processed.
 *
 * @enum {(typeof PendingTxStatus)[keyof typeof PendingTxStatus]}
 */
export const PendingTxStatus = /** @type {const} */ ({
  /** tx was observed but not advanced */
  Observed: 'OBSERVED',
  /** IBC transfer is initiated */
  Advancing: 'ADVANCING',
  /** IBC transfer failed (timed out) */
  AdvanceFailed: 'ADVANCE_FAILED',
  /** IBC transfer is complete */
  Advanced: 'ADVANCED',
  /** Advance skipped and waiting for forward */
  AdvanceSkipped: 'ADVANCE_SKIPPED',
});
harden(PendingTxStatus);
