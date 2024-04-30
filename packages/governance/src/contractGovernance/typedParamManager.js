import { E } from '@endo/eventual-send';
import { ParamTypes } from '../constants.js';
import { CONTRACT_ELECTORATE } from './governParam.js';
import { makeParamManagerBuilder } from './paramManager.js';

const { Fail, quote: q } = assert;

/**
 * @import {Handle, Installation, Instance, Keyword, IssuerKeywordRecord, Invitation, ZCF} from '@agoric/zoe';
 * @import {VoteCounterCreatorFacet, VoteCounterPublicFacet, QuestionSpec, OutcomeRecord, AddQuestion, AddQuestionReturn, GovernanceSubscriptionState, GovernanceTerms, ParamManagerBase, ParamStateRecord, ParamValueForType, UpdateParams} from '../types.js';
 * @import {ParamType} from '../constants.js';
 */

/**
 * @typedef {Record<Keyword, ParamType>} ParamTypesMap
 */
/**
 * @template {ParamStateRecord} M
 * @typedef {{ [R in keyof M]: M[R]['type']}} ParamTypesMapFromRecord
 */
/**
 * @template {ParamTypesMap} M
 * @typedef {{ [T in keyof M]: { type: M[T], value: ParamValueForType<M[T]> } }} ParamRecordsFromTypes
 */

/**
 * @template {ParamTypesMap} M
 * @typedef {{
 *   [K in keyof M as `get${string & K}`]: () => ParamValueForType<M[K]>
 * }} Getters
 */

/**
 * @template {ParamTypesMap} T
 * @typedef {{
 *   [K in keyof T as `update${string & K}`]: (value: ParamValueForType<T[K]>) => void
 * }} Updaters
 */

/**
 * @template {ParamTypesMap} M
 * @typedef {ParamManagerBase & Getters<M> & Updaters<M> & {readonly: () => Getters<M>} & {updateParams: UpdateParams}} TypedParamManager
 */

/**
 * @param {ParamType} type
 */
const builderMethodName = type =>
  `add${type[0].toUpperCase() + type.substring(1)}`;

/** @type {Partial<Record<ParamType, boolean>>} */
const isAsync = {
  invitation: true,
};

/**
 * @template {ParamType} T
 * @typedef {[type: T, value: ParamValueForType<T>]} ST param spec tuple
 */

/**
 * @typedef {{ type: 'invitation', value: Amount<'set'> }} InvitationParam
 */

// XXX better to use the manifest constant ParamTypes
// but importing that here turns this file into a module,
// breaking the ambient typing
/**
 * @typedef {ST<'amount'>
 * | ST<'brand'>
 * | ST<'installation'>
 * | ST<'instance'>
 * | ST<'nat'>
 * | ST<'ratio'>
 * | ST<'string'>
 * | ST<'timestamp'>
 * | ST<'relativeTime'>
 * | ST<'unknown'>} SyncSpecTuple
 *
 * @typedef {['invitation', Invitation]} AsyncSpecTuple
 */

/**
 * @see makeParamManagerSync
 * @template {Record<Keyword, AsyncSpecTuple | SyncSpecTuple>} T
 * @param {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} publisherKit
 * @param {T} spec
 * @param {ZCF} zcf
 * @returns {TypedParamManager<{[K in keyof T]: T[K][0]}>}
 */
export const makeParamManager = (publisherKit, spec, zcf) => {
  const builder = makeParamManagerBuilder(publisherKit, zcf.getZoeService());

  const promises = [];
  for (const [name, [type, value]] of Object.entries(spec)) {
    const add = builder[builderMethodName(type)];
    if (isAsync[type]) {
      promises.push(add(name, value));
    } else {
      add(name, value);
    }
  }
  // XXX kick off promises but don't block. This is a concession to contract reincarnation
  // which cannot block on a remote call.
  // UNTIL https://github.com/Agoric/agoric-sdk/issues/4343
  void E.when(Promise.all(promises), undefined, reason =>
    zcf.shutdownWithFailure(reason),
  );

  // @ts-expect-error cast
  return builder.build();
};
harden(makeParamManager);

/**
 * Used only when the contract has multiple param managers.
 * Exactly one must manage the electorate, which requires the async version.
 *
 * @see makeParamManager
 * @template {Record<Keyword, SyncSpecTuple>} T
 * @param {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} publisherKit
 * @param {T} spec
 * @returns {TypedParamManager<{[K in keyof T]: T[K][0]}>}
 */
export const makeParamManagerSync = (publisherKit, spec) => {
  const builder = makeParamManagerBuilder(publisherKit);

  for (const [name, [type, value]] of Object.entries(spec)) {
    const add = builder[builderMethodName(type)];
    add || Fail`No builder method for param type ${q(type)}`;
    add(name, value);
  }

  // @ts-expect-error cast
  return builder.build();
};
harden(makeParamManagerSync);

/**
 * @template {Record<string, Invitation> & {Electorate: Invitation}} I Private invitation values
 * @template {ParamTypesMap} M Map of types of custom governed terms
 * @param {import('@agoric/notifier').StoredPublisherKit<GovernanceSubscriptionState>} publisherKit
 * @param {ZCF<GovernanceTerms<M>>} zcf
 * @param {I} invitations invitation objects, which must come from privateArgs
 * @param {M} paramTypesMap
 * @returns {TypedParamManager<M & {[K in keyof I]: 'invitation'}>}
 */
export const makeParamManagerFromTerms = (
  publisherKit,
  zcf,
  invitations,
  paramTypesMap,
) => {
  const { governedParams } = zcf.getTerms();
  /** @type {Array<[Keyword, SyncSpecTuple | AsyncSpecTuple]>} */
  const makerSpecEntries = Object.entries(paramTypesMap).map(
    ([paramKey, paramType]) => [
      paramKey,
      /** @type {SyncSpecTuple} */ ([
        paramType,
        governedParams[paramKey].value,
      ]),
    ],
  );
  // Every governed contract has an Electorate param that starts as `initialPoserInvitation` private arg
  for (const [name, invitation] of Object.entries(invitations)) {
    makerSpecEntries.push([name, [ParamTypes.INVITATION, invitation]]);
  }
  const makerSpec = Object.fromEntries(makerSpecEntries);
  makerSpec[CONTRACT_ELECTORATE] ||
    Fail`missing Electorate invitation param value`;

  // @ts-expect-error cast
  return makeParamManager(publisherKit, makerSpec, zcf);
};
harden(makeParamManagerFromTerms);
