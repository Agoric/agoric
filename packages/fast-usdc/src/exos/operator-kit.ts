import { makeTracer } from '@agoric/internal';
import { Fail } from '@endo/errors';
import { M } from '@endo/patterns';
import type { Zone } from '@agoric/zone';
import { CctpTxEvidenceShape } from '../type-guards.js';
import type { CctpTxEvidence } from '../types.js';

const trace: (message: string) => void = makeTracer('TxOperator');

interface OperatorPowers {
  submitEvidence: (evidence: CctpTxEvidence, operatorKit: OperatorKit) => void;
}

interface OperatorStatus {
  disabled?: boolean;
  operatorId: string;
}

interface State {
  operatorId: string;
  powers: OperatorPowers;
  disabled: boolean;
}

const OperatorKitI = {
  admin: M.interface('Admin', {
    disable: M.call().returns(),
  }),

  /**
   * NB: when this kit is an offer result, the smart-wallet will detect the `invitationMakers`
   * key and save it for future offers.
   */
  invitationMakers: M.interface('InvitationMakers', {
    SubmitEvidence: M.call(CctpTxEvidenceShape).returns(M.promise()),
  }),

  operator: M.interface('Operator', {
    submitEvidence: M.call(CctpTxEvidenceShape).returns(M.promise()),
    getStatus: M.call().returns(M.record()),
  }),
};

export const prepareOperatorKit = (
  zone: Zone,
  staticPowers: { makeInertInvitation: Function },
) =>
  zone.exoClassKit(
    'Operator Kit',
    OperatorKitI,
    /**
     * @param operatorId
     * @param powers facet of the durable transaction feed
     */
    (operatorId: string, powers: OperatorPowers): State => {
      return {
        operatorId,
        powers,
        disabled: false,
      };
    },
    {
      admin: {
        disable() {
          trace(`operator ${this.state.operatorId} disabled`);
          this.state.disabled = true;
        },
      },
      invitationMakers: {
        /**
         * Provide an API call in the form of an invitation maker, so that the
         * capability is available in the smart-wallet bridge.
         *
         * NB: The `Invitation` object is evidence that the operation took
         * place, rather than as a means of performing it as in the
         * fluxAggregator contract used for price oracles.
         *
         * @param evidence
         */
        async SubmitEvidence(evidence: CctpTxEvidence): Promise<Invitation> {
          const { operator } = this.facets;
          // TODO(bootstrap integration): cause this call to throw and confirm that it
          // shows up in the the smart-wallet UpdateRecord `error` property
          await operator.submitEvidence(evidence);
          return staticPowers.makeInertInvitation(
            'evidence was pushed in the invitation maker call',
          );
        },
      },
      operator: {
        /**
         * submit evidence from this operator
         *
         * @param evidence
         */
        async submitEvidence(evidence: CctpTxEvidence): Promise<void> {
          const { state } = this;
          !state.disabled || Fail`submitEvidence for disabled operator`;
          const result = state.powers.submitEvidence(evidence, this.facets);
          return result;
        },
        getStatus(): OperatorStatus {
          const { state } = this;
          return {
            operatorId: state.operatorId,
            disabled: state.disabled,
          };
        },
      },
    },
  );

export type OperatorKit = ReturnType<ReturnType<typeof prepareOperatorKit>>;
