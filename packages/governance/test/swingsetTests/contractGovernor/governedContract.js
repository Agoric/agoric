// @ts-check

import { handleParamGovernance } from '../../../src/contractHelper.js';
import {
  assertElectorateMatches,
  makeParamManager,
  ParamTypes,
} from '../../../src/index.js';
import { CONTRACT_ELECTORATE } from '../../../src/paramGovernance/governParam.js';

const MALLEABLE_NUMBER = 'MalleableNumber';

const makeParamTerms = (number, invitationAmount) => {
  return harden({
    [MALLEABLE_NUMBER]: { type: ParamTypes.NAT, value: number },
    [CONTRACT_ELECTORATE]: {
      type: ParamTypes.INVITATION,
      value: invitationAmount,
    },
  });
};

/**
 * @type ContractStartFn< GovernedPublicFacet<{}>, GovernedCreatorFacet<any>, {
 *   electionManager: VoteOnParamChange, main: { MalleableNumber:
 *   ParamRecord<'nat'>, Electorate: ParamRecord<'invitation'>, }, },
 *   {initialPoserInvitation: Payment}>
 */
const start = async (zcf, privateArgs) => {
  const {
    main: { [MALLEABLE_NUMBER]: numberParam, ...otherOovernedTerms },
  } = zcf.getTerms();
  const { initialPoserInvitation } = privateArgs;

  const paramManager = await makeParamManager(
    {
      [MALLEABLE_NUMBER]: ['nat', numberParam.value],
      [CONTRACT_ELECTORATE]: ['invitation', initialPoserInvitation],
    },
    zcf.getZoeService(),
  );

  const { wrapPublicFacet, wrapCreatorFacet } = handleParamGovernance(
    zcf,
    paramManager,
  );

  assertElectorateMatches(paramManager, otherOovernedTerms);

  return {
    publicFacet: wrapPublicFacet({}),
    creatorFacet: wrapCreatorFacet({}),
  };
};

harden(start);
harden(MALLEABLE_NUMBER);
harden(makeParamTerms);

export { start, MALLEABLE_NUMBER, makeParamTerms };
