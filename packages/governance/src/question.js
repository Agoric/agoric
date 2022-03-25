// @ts-check

import { Far, passStyleOf } from '@endo/marshal';
import { keyEQ } from '@agoric/store';
import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { Nat } from '@agoric/nat';

import { makeAssertInstance } from './paramGovernance/assertions.js';

const { details: X, quote: q } = assert;

// Topics being voted on are 'Questions'. Before a Question is known to a
// electorate, the parameters can be described with a QuestionSpec. Once the
// question has been presented to an Electorate, there is a QuestionDetails
// record that also includes the VoteCounter which will determine the outcome
// and the questionHandle that uniquely identifies it.

/**
 * "unranked" is more formally known as "approval" voting, but this is hard for
 * people to intuit when there are only two alternatives.
 *
 * @type {{
 *   UNRANKED: 'unranked';
 *   ORDER: 'order';
 * }}
 */
const ChoiceMethod = {
  UNRANKED: 'unranked',
  ORDER: 'order',
};

/**
 * @type {{
 *   PARAM_CHANGE: 'param_change';
 *   ELECTION: 'election';
 *   SURVEY: 'survey';
 * }}
 */
const ElectionType = {
  // A parameter is named, and a new value proposed
  PARAM_CHANGE: 'param_change',
  // choose one or multiple winners, depending on ChoiceMethod
  ELECTION: 'election',
  SURVEY: 'survey',
};

/**
 * @type {{
 *   MAJORITY: 'majority';
 *   NO_QUORUM: 'no_quorum';
 *   ALL: 'all';
 * }}
 */
const QuorumRule = {
  MAJORITY: 'majority',
  NO_QUORUM: 'no_quorum',
  // The election isn't valid unless all voters vote
  ALL: 'all',
};

/** @type {LooksLikeSimpleIssue} */
const looksLikeSimpleIssue = issue => {
  assert.typeof(issue, 'object', X`Issue ("${issue}") must be a record`);
  assert(
    issue && typeof issue.text === 'string',
    X`Issue ("${issue}") must be a record with text: aString`,
  );
  return undefined;
};

/** @type {LooksLikeParamChangeIssue} */
const looksLikeParamChangeIssue = issue => {
  assert(issue, X`argument to looksLikeParamChangeIssue cannot be null`);
  assert.typeof(issue, 'object', X`Issue ("${issue}") must be a record`);
  assert.typeof(
    issue && issue.paramSpec,
    'object',
    X`Issue ("${issue}") must be a record with paramSpec: anObject`,
  );
  assert(issue && issue.proposedValue);
  const assertInstance = makeAssertInstance('contract');
  assertInstance(issue.contract);
};

/** @type {LooksLikeIssueForType} */
const looksLikeIssueForType = (electionType, issue) => {
  assert(
    passStyleOf(issue) === 'copyRecord',
    X`A question can only be a pass-by-copy record: ${issue}`,
  );

  switch (electionType) {
    case ElectionType.SURVEY:
    case ElectionType.ELECTION:
      looksLikeSimpleIssue(/** @type {SimpleIssue} */ (issue));
      break;
    case ElectionType.PARAM_CHANGE:
      looksLikeParamChangeIssue(/** @type {ParamChangeIssue} */ (issue));
      break;
    default:
      throw Error(`Election type unrecognized`);
  }
};

/** @type {PositionIncluded} */
const positionIncluded = (positions, p) => positions.some(e => keyEQ(e, p));

// QuestionSpec contains the subset of QuestionDetails that can be specified before
/** @type {LooksLikeClosingRule} */
function looksLikeClosingRule(closingRule) {
  assert(closingRule, X`argument to looksLikeClosingRule cannot be null`);
  assert.typeof(
    closingRule,
    'object',
    X`ClosingRule ("${closingRule}") must be a record`,
  );
  Nat(closingRule && closingRule.deadline);
  const timer = closingRule && closingRule.timer;
  assert(passStyleOf(timer) === 'remotable', X`Timer must be a timer ${timer}`);
}

const assertEnumIncludes = (enumeration, value, name) => {
  assert(
    Object.getOwnPropertyNames(enumeration)
      .map(k => enumeration[k])
      .includes(value),
    X`Illegal ${name}: ${value}`,
  );
};

/** @type {LooksLikeQuestionSpec} */
const looksLikeQuestionSpec = ({
  method,
  issue,
  positions,
  electionType,
  maxChoices,
  closingRule,
  quorumRule,
  tieOutcome,
}) => {
  looksLikeIssueForType(electionType, issue);

  assert(
    positions.every(
      p => passStyleOf(p) === 'copyRecord',
      X`positions must be records`,
    ),
  );
  assert(
    positionIncluded(positions, tieOutcome),
    X`tieOutcome must be a legal position: ${q(tieOutcome)}`,
  );
  assertEnumIncludes(QuorumRule, quorumRule, 'QuorumRule');
  assertEnumIncludes(ElectionType, electionType, 'ElectionType');
  assertEnumIncludes(ChoiceMethod, method, 'ChoiceMethod');
  assert(maxChoices > 0, X`maxChoices must be positive: ${maxChoices}`);
  assert(maxChoices <= positions.length, X`Choices must not exceed length`);

  looksLikeClosingRule(closingRule);

  return harden({
    method,
    issue,
    positions,
    maxChoices: Number(maxChoices),
    electionType,
    closingRule,
    quorumRule,
    tieOutcome,
  });
};

/** @type {BuildUnrankedQuestion} */
const buildUnrankedQuestion = (questionSpec, counterInstance) => {
  const questionHandle = makeHandle('Question');

  const getDetails = () =>
    harden({
      ...questionSpec,
      questionHandle,
      counterInstance,
    });

  /** @type {Question} */
  return Far('question details', {
    getVoteCounter: () => counterInstance,
    getDetails,
  });
};

harden(buildUnrankedQuestion);
harden(ChoiceMethod);
harden(ElectionType);
harden(looksLikeIssueForType);
harden(looksLikeQuestionSpec);
harden(positionIncluded);
harden(QuorumRule);

export {
  buildUnrankedQuestion,
  ChoiceMethod,
  ElectionType,
  looksLikeIssueForType,
  looksLikeQuestionSpec,
  positionIncluded,
  QuorumRule,
};
