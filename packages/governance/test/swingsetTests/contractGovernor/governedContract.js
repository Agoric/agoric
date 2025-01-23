import { Far } from '@endo/marshal';
import { handleParamGovernance } from '../../../src/contractHelper.js';
import { ParamTypes } from '../../../src/index.js';
import { CONTRACT_ELECTORATE } from '../../../src/contractGovernance/governParam.js';

/**
 * @import {GovernanceTerms} from '../../../src/types.js';
 */

const MALLEABLE_NUMBER = 'MalleableNumber';

const makeTerms = (number, invitationAmount) => {
  return harden({
    governedParams: {
      [MALLEABLE_NUMBER]: { type: ParamTypes.NAT, value: number },
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
    },
  });
};

/**
 *
 * @param {ZCF<
 * GovernanceTerms<{
 *   MalleableNumber: 'nat',
 * }>>} zcf
 * @param {{initialPoserInvitation: Invitation}} privateArgs
 */
const start = async (zcf, privateArgs) => {
  const { augmentPublicFacet, makeFarGovernorFacet, params } =
    await handleParamGovernance(zcf, privateArgs.initialPoserInvitation, {
      [MALLEABLE_NUMBER]: ParamTypes.NAT,
    });

  let governanceAPICalled = 0;
  const governanceApi = () => (governanceAPICalled += 1);
  return {
    publicFacet: augmentPublicFacet({
      getNum: () => params.getMalleableNumber(),
      getApiCalled: () => governanceAPICalled,
    }),
    creatorFacet: makeFarGovernorFacet(Far('governedContract creatorFacet'), {
      governanceApi,
    }),
  };
};

harden(start);
harden(MALLEABLE_NUMBER);
harden(makeTerms);

export { start, MALLEABLE_NUMBER, makeTerms };
