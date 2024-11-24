import { makeTracer } from '@agoric/internal';
import { prepareDurablePublishKit } from '@agoric/notifier';
import type { Zone } from '@agoric/zone';
import { M } from '@endo/patterns';
import { CctpTxEvidenceShape } from '../type-guards.js';
import type { CctpTxEvidence } from '../types.js';
import { defineInertInvitation } from '../utils/zoe.js';
import type { OperatorKit } from './operator-kit.js';
import { prepareOperatorKit } from './operator-kit.js';

const trace = makeTracer('TxFeed', true);

/** Name in the invitation purse (keyed also by this contract instance) */
export const INVITATION_MAKERS_DESC = 'oracle operator invitation';

const TransactionFeedKitI = harden({
  operatorPowers: M.interface('Transaction Feed Admin', {
    submitEvidence: M.call(CctpTxEvidenceShape, M.any()).returns(),
  }),
  creator: M.interface('Transaction Feed Creator', {
    initOperator: M.call(M.string()).returns(M.record()),
    makeOperatorInvitation: M.call(M.string()).returns(M.promise()),
    removeOperator: M.call(M.string()).returns(),
  }),
  public: M.interface('Transaction Feed Public', {
    getEvidenceSubscriber: M.call().returns(M.remotable()),
  }),
});

interface State {
  operators: MapStore<string, OperatorKit>;
  pending: MapStore<string, MapStore<string, CctpTxEvidence>>;
}

export const prepareTransactionFeedKit = (zone: Zone, zcf: ZCF) => {
  const kinds = zone.mapStore<string, unknown>('Kinds');
  const makeDurablePublishKit = prepareDurablePublishKit(
    kinds,
    'Transaction Feed',
  );
  const { publisher, subscriber } = makeDurablePublishKit<CctpTxEvidence>();

  const makeInertInvitation = defineInertInvitation(zcf, 'submitting evidence');

  const makeOperatorKit = prepareOperatorKit(zone, {
    makeInertInvitation,
  });

  return zone.exoClassKit(
    'Fast USDC Feed',
    TransactionFeedKitI,
    (): State => {
      const operators = zone.mapStore<string, OperatorKit>('operators', {
        durable: true,
      });
      const pending = zone.mapStore<string, MapStore<string, CctpTxEvidence>>(
        'pending',
        {
          durable: true,
        },
      );
      return { operators, pending };
    },
    {
      creator: {
        /**
         * An "operator invitation" is an invitation to be an operator in the
         * oracle network, with the able to submit data to submit evidence of
         * CCTP transactions.
         *
         * @param operatorId unique per contract instance
         */
        makeOperatorInvitation(
          operatorId: string,
        ): Promise<Invitation<OperatorKit>> {
          const { creator } = this.facets;
          trace('makeOperatorInvitation', operatorId);

          return zcf.makeInvitation(seat => {
            seat.exit();
            return creator.initOperator(operatorId);
          }, INVITATION_MAKERS_DESC);
        },

        initOperator(operatorId: string) {
          const { operators, pending } = this.state;
          trace('initOperator', operatorId);

          const operatorKit = makeOperatorKit(
            operatorId,
            this.facets.operatorPowers,
          );
          operators.init(operatorId, operatorKit);
          pending.init(
            operatorId,
            zone.detached().mapStore('pending evidence'),
          );

          return operatorKit;
        },

        async removeOperator(operatorId: string) {
          const { operators } = this.state;
          trace('removeOperator', operatorId);
          const operatorKit = operators.get(operatorId);
          operatorKit.admin.disable();
          operators.delete(operatorId);
        },
      },
      operatorPowers: {
        /**
         * Add evidence from an operator.
         * @param evidence
         * @param operatorKit
         */
        submitEvidence(evidence: CctpTxEvidence, operatorKit: OperatorKit) {
          const { pending } = this.state;
          trace(
            'submitEvidence',
            operatorKit.operator.getStatus().operatorId,
            evidence,
          );
          const { operatorId } = operatorKit.operator.getStatus();

          // TODO should this verify that the operator is one made by this exo?
          // This doesn't work...
          // operatorKit === operators.get(operatorId) ||
          //   Fail`operatorKit mismatch`;

          // TODO validate that it's a valid for Fast USDC before accepting
          // E.g. that the `recipientAddress` is the FU settlement account and that
          // the EUD is a chain supported by FU.
          const { txHash } = evidence;

          // accept the evidence
          {
            const pendingStore = pending.get(operatorId);
            if (pendingStore.has(txHash)) {
              trace(`operator ${operatorId} already reported ${txHash}`);
            } else {
              pendingStore.init(txHash, evidence);
            }
          }

          // check agreement
          const found = [...pending.values()].filter(store =>
            store.has(txHash),
          );
          // TODO determine the real policy for checking agreement
          if (found.length < pending.getSize()) {
            // not all have seen it
            return;
          }

          // TODO verify that all found deep equal

          // all agree, so remove from pending and publish
          for (const pendingStore of pending.values()) {
            pendingStore.delete(txHash);
          }
          publisher.publish(evidence);
        },
      },
      public: {
        getEvidenceSubscriber: () => subscriber,
      },
    },
  );
};
harden(prepareTransactionFeedKit);

export type TransactionFeedKit = ReturnType<
  ReturnType<typeof prepareTransactionFeedKit>
>;
