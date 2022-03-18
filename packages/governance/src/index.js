// @ts-check

import './types.js';

export {
  ChoiceMethod,
  ElectionType,
  QuorumRule,
  looksLikeQuestionSpec,
  positionIncluded,
  looksLikeIssueForType,
  buildUnrankedQuestion,
} from './question.js';

export {
  validateQuestionDetails,
  validateQuestionFromCounter,
} from './contractGovernor.js';

export { handleParamGovernance } from './contractHelper.js';

export {
  assertBallotConcernsQuestion,
  makeParamChangePositions,
  setupParamGovernance,
  validateParamChangeQuestion,
  CONTRACT_ELECTORATE,
} from './contractGovernance/governParam.js';

export {
  assertElectorateMatches,
  makeParamManagerBuilder,
} from './contractGovernance/paramManager.js';

export {
  makeParamManager,
  makeParamManagerSync,
} from './contractGovernance/typedParamManager.js';

export {
  assertContractGovernance,
  assertContractElectorate,
} from './validators.js';

export { ParamTypes } from './constants.js';

export {
  makeGovernedAmount,
  makeGovernedBrand,
  makeGovernedInstallation,
  makeGovernedInstance,
  makeGovernedInvitation,
  makeGovernedNat,
  makeGovernedRatio,
  makeGovernedString,
  makeGovernedUnknown,
} from './contractGovernance/paramMakers.js';

export { makeBinaryVoteCounter } from './binaryVoteCounter.js';
