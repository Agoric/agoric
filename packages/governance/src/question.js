// @ts-check

import { Far, passStyleOf } from '@endo/marshal';
import { keyEQ } from '@agoric/store';
import { makeHandle } from '@agoric/zoe/src/makeHandle.js';
import { Nat } from '@agoric/nat';

import { makeAssertInstance } from './contractGovernance/assertions.js';

const { details: X, quote: q } = assert;

// Topics being voted on are 'Questions'. Before a Question is known to a
// electorate, the parameters can be described with a QuestionSpec. Once the
// question has been presented to an Electorate, there is a QuestionDetails
// record that also includes the VoteCounter which will determine the outcome
// and the questionHandle that uniquely identifies it.

/**
 * "unranked" is more formally known as "approval" voting, but this is hard for
 * people to intuit when there are only two alternatives.
 */
const ChoiceMethod = /** @type {const} */ ({
  UNRANKED: 'unranked',
  ORDER: 'order',
});

const ElectionType = /** @type {const} */ ({
  // A parameter is named, and a new value proposed
  PARAM_CHANGE: 'param_change',
  // choose one or multiple winners, depending on ChoiceMethod
  ELECTION: 'election',
  SURVEY: 'survey',
  // whether or not to invoke an API method
  API_INVOCATION: 'api_invocation',
});

const QuorumRule = /** @type {const} */ ({
  MAJORITY: 'majority',
  NO_QUORUM: 'no_quorum',
  // The election isn't valid unless all voters vote
  ALL: 'all',
});

/**
 * @param {unknown} issue
 * @returns {asserts issue is SimpleIssue}
 */

const assertSimpleIssue = issue => {
  assert.typeof(issue, 'object', X`Issue ("${issue}") must be a record`);
  assert(
    issue && typeof issue.text === 'string',
    X`Issue ("${issue}") must be a record with text: aString`,
  );
};

/**
 * @param {unknown} issue
 * @returns {asserts issue is ParamChangeIssue<unknown>}
 */

const assertParamChangeIssue = issue => {
  assert(issue, 'argument to assertParamChangeIssue cannot be null');
  assert.typeof(issue, 'object', X`Issue ("${issue}") must be a record`);
  assert(issue?.spec?.paramPath, X`Issue ("${issue}") must have a paramPath`);
  assert(issue?.spec?.changes, X`Issue ("${issue}") must have changes`);

  assert.typeof(
    issue.spec.changes,
    'object',
    X`changes ("${issue.changes}") must be a record`,
  );

  const assertInstance = makeAssertInstance('contract');
  assertInstance(issue.contract);
};

/**
 * @param {unknown} issue
 * @returns {asserts issue is ApiInvocationIssue}
 */

const assertApiInvocation = issue => {
  assert.typeof(issue, 'object', X`Issue ("${issue}") must be a record`);
  assert(
    issue && typeof issue.apiMethodName === 'string',
    X`Issue ("${issue}") must be a record with apiMethodName: aString`,
  );
};

/**
 * @param {ElectionType} electionType
 * @param {unknown} issue
 * @returns {asserts issue is Issue}
 */

const assertIssueForType = (electionType, issue) => {
  assert(
    passStyleOf(issue) === 'copyRecord',
    X`A question can only be a pass-by-copy record: ${issue}`,
  );

  switch (electionType) {
    case ElectionType.SURVEY:
    case ElectionType.ELECTION:
      assertSimpleIssue(issue);
      break;
    case ElectionType.PARAM_CHANGE:
      assertParamChangeIssue(issue);
      break;
    case ElectionType.API_INVOCATION:
      assertApiInvocation(issue);
      break;
    default:
      throw Error(`Election type unrecognized`);
  }
};

/** @type {PositionIncluded} */
const positionIncluded = (positions, p) => positions.some(e => keyEQ(e, p));

// QuestionSpec contains the subset of QuestionDetails that can be specified before
/**
 * @param {unknown} closingRule
 * @returns {asserts closingRule is ClosingRule}
 */

function assertClosingRule(closingRule) {
  assert(closingRule, 'argument to assertClosingRule cannot be null');
  assert.typeof(
    closingRule,
    'object',
    X`ClosingRule ("${closingRule}") must be a record`,
  );
  Nat(closingRule?.deadline);
  const timer = closingRule?.timer;
  assert.equal(
    passStyleOf(timer),
    'remotable',
    X`Timer must be a timer ${timer}`,
  );
}

const assertEnumIncludes = (enumeration, value, name) => {
  assert(
    Object.keys(enumeration)
      .map(k => enumeration[k])
      .includes(value),
    X`Illegal ${name}: ${value}`,
  );
};

/**
 * @param {QuestionSpec} allegedQuestionSpec
 * @returns {QuestionSpec}
 */
const coerceQuestionSpec = ({
  method,
  issue,
  positions,
  electionType,
  maxChoices,
  closingRule,
  quorumRule,
  tieOutcome,
}) => {
  assertIssueForType(electionType, issue);

  assert(
    positions.every(
      p => passStyleOf(p) === 'copyRecord',
      'positions must be records',
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
  assert(maxChoices <= positions.length, 'Choices must not exceed length');

  assertClosingRule(closingRule);

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
harden(assertIssueForType);
harden(coerceQuestionSpec);
harden(positionIncluded);
harden(QuorumRule);

export {
  buildUnrankedQuestion,
  ChoiceMethod,
  ElectionType,
  assertIssueForType,
  coerceQuestionSpec,
  positionIncluded,
  QuorumRule,
};
