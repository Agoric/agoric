import { makeTracer } from '@agoric/internal';
import { appendToStoredArray } from '@agoric/store/src/stores/store-utils.js';
import { AmountKeywordRecordShape } from '@agoric/zoe/src/typeGuards.js';
import { Fail, makeError, q } from '@endo/errors';
import { E } from '@endo/eventual-send';
import { M } from '@endo/patterns';
import { PendingTxStatus, TerminalTxStatus, TxStatus } from '../constants.js';
import {
  CctpTxEvidenceShape,
  EvmHashShape,
  PendingTxShape,
} from '../type-guards.js';

/**
 * @import {MapStore, SetStore} from '@agoric/store';
 * @import {Zone} from '@agoric/zone';
 * @import {CctpTxEvidence, NobleAddress, PendingTx, EvmHash, LogFn, TransactionRecord, EvidenceWithRisk, RiskAssessment} from '../types.js';
 */

/**
 * @typedef {`pendingTx:${bigint}:${NobleAddress}`} PendingTxKey
 * The string template is for developer visibility but not meant to ever be parsed.
 */

/**
 * Create the key for the pendingTxs MapStore.
 *
 * The key is a composite but not meant to be parsable.
 *
 * @param {NobleAddress} nfa Noble Forwarding Account (implies EUD)
 * @param {bigint} amount
 * @returns {PendingTxKey}
 */
const makePendingTxKey = (nfa, amount) =>
  // amount can't contain colon
  `pendingTx:${amount}:${nfa}`;

/**
 * Get the key for the pendingTxs MapStore.
 *
 * @param {CctpTxEvidence} evidence
 * @returns {PendingTxKey}
 */
const pendingTxKeyOf = evidence => {
  const { amount, forwardingAddress } = evidence.tx;
  return makePendingTxKey(forwardingAddress, amount);
};

/**
 * @typedef {{
 *  log?: LogFn;
 *  marshaller: ERef<Marshaller>;
 * }} StatusManagerPowers
 */

export const stateShape = harden({
  pendingSettleTxs: M.remotable(),
  seenTxs: M.remotable(),
  storedCompletedTxs: M.remotable(),
});

/**
 * The `StatusManager` keeps track of Pending and Seen Transactions
 * via {@link PendingTxStatus} states, aiding in coordination between the `Advancer`
 * and `Settler`.
 *
 * XXX consider separate facets for `Advancing` and `Settling` capabilities.
 *
 * @param {Zone} zone
 * @param {ERef<StorageNode>} txnsNode
 * @param {StatusManagerPowers} caps
 */
export const prepareStatusManager = (
  zone,
  txnsNode,
  {
    marshaller,
    // eslint-disable-next-line no-unused-vars
    log = makeTracer('StatusManager', true),
  } = /** @type {StatusManagerPowers} */ ({}),
) => {
  /**
   * Keyed by a tuple of the Noble Forwarding Account and amount.
   * @type {MapStore<PendingTxKey, PendingTx[]>}
   */
  const pendingSettleTxs = zone.mapStore('PendingSettleTxs', {
    keyShape: M.string(),
    valueShape: M.arrayOf(PendingTxShape),
  });

  /**
   * Transactions seen *ever* by the contract.
   *
   * Note that like all durable stores, this MapStore is kept in IAVL. It stores
   * the `blockTimestamp` so that later we can prune old transactions.
   *
   * Note that `blockTimestamp` can drift between chains. Fortunately all CCTP
   * chains use the same Unix epoch and won't drift more than minutes apart,
   * which is more than enough precision for pruning old transaction.
   *
   * @type {MapStore<EvmHash, NatValue>}
   */
  const seenTxs = zone.mapStore('SeenTxs', {
    keyShape: M.string(),
    valueShape: M.nat(),
  });

  /**
   * Transactions that have completed, but are still in vstorage.
   *
   * @type {SetStore<EvmHash>}
   */
  const storedCompletedTxs = zone.setStore('StoredCompletedTxs', {
    keyShape: M.string(),
  });

  /**
   * @param {EvmHash} txId
   * @param {TransactionRecord} record
   */
  const publishTxnRecord = (txId, record) => {
    const txNode = E(txnsNode).makeChildNode(txId, {
      sequence: true, // avoid overwriting other output in the block
    });

    // XXX awkward for publish* to update a store, but it's temporary
    if (record.status && TerminalTxStatus[record.status]) {
      // UNTIL https://github.com/Agoric/agoric-sdk/issues/7405
      // Queue it for deletion later because if we deleted it now the earlier
      // writes in this block would be wiped. For now we keep track of what to
      // delete when we know it'll be another block.
      storedCompletedTxs.add(txId);
    }

    // Don't await, just writing to vstorage.
    void E.when(E(marshaller).toCapData(record), capData =>
      E(txNode).setValue(JSON.stringify(capData)),
    );
  };

  /**
   * @param {CctpTxEvidence['txHash']} hash
   * @param {CctpTxEvidence} evidence
   */
  const publishEvidence = (hash, evidence) => {
    // Don't await, just writing to vstorage.
    publishTxnRecord(hash, harden({ evidence, status: TxStatus.Observed }));
  };

  /**
   * Ensures that `txHash+chainId` has not been processed
   * and adds entry to `seenTxs` set.
   *
   * Also records the CctpTxEvidence and status in `pendingTxs`.
   *
   * @param {CctpTxEvidence} evidence
   * @param {PendingTxStatus} status
   * @param {string[]} [risksIdentified]
   */
  const initPendingTx = (evidence, status, risksIdentified) => {
    const { txHash } = evidence;
    if (seenTxs.has(txHash)) {
      throw makeError(`Transaction already seen: ${q(txHash)}`);
    }
    seenTxs.init(txHash, evidence.blockTimestamp);

    appendToStoredArray(
      pendingSettleTxs,
      pendingTxKeyOf(evidence),
      harden({ ...evidence, status }),
    );
    publishEvidence(txHash, evidence);
    if (status === PendingTxStatus.AdvanceSkipped) {
      publishTxnRecord(txHash, harden({ status, risksIdentified }));
    } else if (status !== PendingTxStatus.Observed) {
      // publishEvidence publishes Observed
      publishTxnRecord(txHash, harden({ status }));
    }
  };

  /**
   * Update the pending transaction status.
   *
   * @param {{nfa: NobleAddress, amount: bigint}} keyParts
   * @param {PendingTxStatus} status
   */
  function setPendingTxStatus({ nfa, amount }, status) {
    const key = makePendingTxKey(nfa, amount);
    pendingSettleTxs.has(key) || Fail`no advancing tx with ${{ nfa, amount }}`;
    const pending = pendingSettleTxs.get(key);
    const ix = pending.findIndex(tx => tx.status === PendingTxStatus.Advancing);
    ix >= 0 || Fail`no advancing tx with ${{ nfa, amount }}`;
    const [prefix, tx, suffix] = [
      pending.slice(0, ix),
      pending[ix],
      pending.slice(ix + 1),
    ];
    const txpost = { ...tx, status };
    pendingSettleTxs.set(key, harden([...prefix, txpost, ...suffix]));
    publishTxnRecord(tx.txHash, harden({ status }));
  }

  return zone.exo(
    'Fast USDC Status Manager',
    M.interface('StatusManagerI', {
      // TODO: naming scheme for transition events
      advance: M.call(CctpTxEvidenceShape).returns(),
      advanceOutcome: M.call(M.string(), M.nat(), M.boolean()).returns(),
      skipAdvance: M.call(CctpTxEvidenceShape, M.arrayOf(M.string())).returns(),
      advanceOutcomeForMintedEarly: M.call(EvmHashShape, M.boolean()).returns(),
      advanceOutcomeForUnknownMint: M.call(CctpTxEvidenceShape).returns(),
      observe: M.call(CctpTxEvidenceShape).returns(),
      hasBeenObserved: M.call(CctpTxEvidenceShape).returns(M.boolean()),
      deleteCompletedTxs: M.call().returns(M.undefined()),
      dequeueStatus: M.call(M.string(), M.bigint()).returns(
        M.or(
          {
            txHash: EvmHashShape,
            status: M.or(...Object.values(PendingTxStatus)),
          },
          M.undefined(),
        ),
      ),
      disbursed: M.call(EvmHashShape, AmountKeywordRecordShape).returns(
        M.undefined(),
      ),
      forwarded: M.call(EvmHashShape, M.boolean()).returns(),
      lookupPending: M.call(M.string(), M.bigint()).returns(
        M.arrayOf(PendingTxShape),
      ),
    }),
    {
      /**
       * Add a new transaction with ADVANCING status
       *
       * NB: this acts like observe() but subsequently records an ADVANCING
       * state
       *
       * @param {CctpTxEvidence} evidence
       */
      advance(evidence) {
        initPendingTx(evidence, PendingTxStatus.Advancing);
      },

      /**
       * Add a new transaction with ADVANCE_SKIPPED status
       *
       * NB: this acts like observe() but subsequently records an
       * ADVANCE_SKIPPED state along with risks identified
       *
       * @param {CctpTxEvidence} evidence
       * @param {string[]} risksIdentified
       */
      skipAdvance(evidence, risksIdentified) {
        initPendingTx(
          evidence,
          PendingTxStatus.AdvanceSkipped,
          risksIdentified,
        );
      },

      /**
       * Record result of an ADVANCING transaction
       *
       * @param {NobleAddress} nfa Noble Forwarding Account
       * @param {import('@agoric/ertp').NatValue} amount
       * @param {boolean} success - Advanced vs. AdvanceFailed
       * @throws {Error} if nothing to advance
       */
      advanceOutcome(nfa, amount, success) {
        setPendingTxStatus(
          { nfa, amount },
          success ? PendingTxStatus.Advanced : PendingTxStatus.AdvanceFailed,
        );
      },

      /**
       * If minted while advancing, publish a status update for the advance
       * to vstorage.
       *
       * Does not add or amend `pendingSettleTxs` as this has
       * already settled.
       *
       * @param {EvmHash} txHash
       * @param {boolean} success whether the Transfer succeeded
       */
      advanceOutcomeForMintedEarly(txHash, success) {
        publishTxnRecord(
          txHash,
          harden({
            status: success
              ? PendingTxStatus.Advanced
              : PendingTxStatus.AdvanceFailed,
          }),
        );
      },

      /**
       * If minted before observed and the evidence is eventually
       * reported, publish the evidence without adding to `pendingSettleTxs`
       *
       * @param {CctpTxEvidence} evidence
       */
      advanceOutcomeForUnknownMint(evidence) {
        const { txHash } = evidence;
        // unexpected path, since `hasBeenObserved` will be called before this
        if (seenTxs.has(txHash)) {
          throw makeError(`Transaction already seen: ${q(txHash)}`);
        }
        seenTxs.init(txHash, evidence.blockTimestamp);
        publishEvidence(txHash, evidence);
      },

      /**
       * Add a new transaction with OBSERVED status
       * @param {CctpTxEvidence} evidence
       */
      observe(evidence) {
        initPendingTx(evidence, PendingTxStatus.Observed);
      },

      /**
       * Note: ADVANCING state implies tx has been OBSERVED
       *
       * @param {CctpTxEvidence} evidence
       */
      hasBeenObserved(evidence) {
        return seenTxs.has(evidence.txHash);
      },

      // UNTIL https://github.com/Agoric/agoric-sdk/issues/7405
      deleteCompletedTxs() {
        for (const txHash of storedCompletedTxs.values()) {
          // As of now, setValue('') on a non-sequence node will delete it
          const txNode = E(txnsNode).makeChildNode(txHash, {
            sequence: false,
          });
          void E(txNode)
            .setValue('')
            .then(() => storedCompletedTxs.delete(txHash));
        }
      },

      /**
       * Remove and return the oldest pending settlement transaction that matches the given
       * forwarding account and amount. Since multiple pending transactions may exist with
       * identical (account, amount) pairs, we process them in FIFO order.
       *
       * @param {NobleAddress} nfa
       * @param {bigint} amount
       * @returns {Pick<PendingTx, 'status' | 'txHash'> | undefined} undefined if no pending
       *   transactions exist for this address and amount combination.
       */
      dequeueStatus(nfa, amount) {
        const key = makePendingTxKey(nfa, amount);
        if (!pendingSettleTxs.has(key)) return undefined;
        const pending = pendingSettleTxs.get(key);

        if (pending.length === 0) {
          return undefined;
        }
        // extract first item
        const [{ status, txHash }, ...remaining] = pending;

        if (remaining.length) {
          pendingSettleTxs.set(key, harden(remaining));
        } else {
          pendingSettleTxs.delete(key);
        }

        return harden({ status, txHash });
      },

      /**
       * Mark a transaction as `DISBURSED`
       *
       * @param {EvmHash} txHash
       * @param {import('./liquidity-pool.js').RepayAmountKWR} split
       */
      disbursed(txHash, split) {
        publishTxnRecord(txHash, harden({ split, status: TxStatus.Disbursed }));
      },

      /**
       * Mark a transaction as `FORWARDED` or `FORWARD_FAILED`
       *
       * @param {EvmHash} txHash
       * @param {boolean} success
       */
      forwarded(txHash, success) {
        publishTxnRecord(
          txHash,
          harden({
            status: success ? TxStatus.Forwarded : TxStatus.ForwardFailed,
          }),
        );
      },

      /**
       * Lookup all pending entries for a given address and amount
       *
       * XXX only used in tests. should we remove?
       *
       * @param {NobleAddress} nfa
       * @param {bigint} amount
       * @returns {PendingTx[]}
       */
      lookupPending(nfa, amount) {
        const key = makePendingTxKey(nfa, amount);
        if (!pendingSettleTxs.has(key)) {
          return harden([]);
        }
        return pendingSettleTxs.get(key);
      },
    },
    { stateShape },
  );
};
harden(prepareStatusManager);

/** @typedef {ReturnType<typeof prepareStatusManager>} StatusManager */
