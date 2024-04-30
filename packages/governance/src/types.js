export {};

/**
 * @import {AdminFacet, Handle, Installation, Instance, Invitation, Keyword, IssuerKeywordRecord, ZCF} from '@agoric/zoe';
 * @import {Ratio} from '@agoric/zoe/src/contractSupport/types.js';
 * @import {ContractStartFunction, InstallationStart} from '@agoric/zoe/src/zoeService/utils.js';
 */

/**
 * @typedef { 'unranked' | 'order' | 'plurality' } ChoiceMethod
 * * UNRANKED: "unranked voting" means that the voter specifies some number of
 *    positions, and is endorsing them equally.
 * * ORDER: The voter assigns ordinal numbers to some of the positions. The
 *    positions will be treated as an ordered list with no gaps.
 *
 * When voters are limited to choosing a single candidate, either UNRANKED or
 * ORDER would work. UNRANKED has a simpler representation so we use that.
 */

/**
 * @typedef { 'param_change' | 'election' | 'survey' | 'api_invocation' |
 *   'offer_filter' } ElectionType
 * param_change is very specific. Survey means multiple answers are possible,
 * Election means some candidates are going to "win". It's not clear these are
 * orthogonal. The important distinction is that param_change has a structured
 * issue, while the others have a issue presented as a string.
 */

/** @import {ParamType} from './constants.js' */

/**
 * @typedef { 'majority' | 'all' | 'no_quorum' } QuorumRule
 */

/**
 * @typedef {object} SimpleIssue
 * @property {string} text
 */

/**
 * @typedef { Amount | Brand | Installation | Instance | bigint |
 *   Ratio | string | import('@agoric/time').TimestampRecord |
 *   import('@agoric/time').RelativeTimeRecord | unknown } ParamValue
 */

// XXX better to use the manifest constant ParamTypes
// but importing that here turns this file into a module,
// breaking the ambient typing
/**
 * @template {ParamType} T
 * @typedef {T extends 'amount' ? Amount<any> :
 * T extends 'brand' ? Brand :
 * T extends 'installation' ? Installation:
 * T extends 'instance' ? Instance :
 * T extends 'invitation' ? Amount<'set'> : // XXX this is the getter value but not the setter
 * T extends 'nat' ? bigint :
 * T extends 'ratio' ? Ratio :
 * T extends 'string' ? string :
 * T extends 'timestamp' ? import('@agoric/time').Timestamp :
 * T extends 'relativeTime' ? import('@agoric/time').RelativeTime :
 * T extends 'unknown' ? unknown :
 * never
 * } ParamValueForType
 */

/**
 * @template {ParamType} [T=ParamType]
 * @typedef {{ type: T, value: ParamValueForType<T> }} ParamValueTyped<T>
 */

/**
 * Terms a contract must provide in order to be governed.
 *
 * @template {import('./contractGovernance/typedParamManager.js').ParamTypesMap} T Governed parameters of contract
 * @typedef {{
 *   electionManager: import('@agoric/zoe/src/zoeService/utils.js').Instance<import('./contractGovernor.js')['start']>,
 *   governedParams: import('./contractGovernance/typedParamManager.js').ParamRecordsFromTypes<T & {
 *     Electorate: 'invitation'
 *   }>
 * }} GovernanceTerms<T>
 */

/**
 * @typedef { SimpleIssue | ParamChangeIssue<unknown> | ApiInvocationIssue |
 *   OfferFilterIssue } Issue
 */

/**
 * @typedef {object} QuestionTerms - QuestionSpec plus the Electorate Instance and
 *   a numerical threshold for the quorum. (The voteCounter doesn't know the
 *   size of the electorate, so the Electorate has to say what limit to enforce.)
 * @property {QuestionSpec} questionSpec
 * @property {number} quorumThreshold
 * @property {Instance} electorate
 */

/**
 * @typedef {object} TextPosition
 * @property {string} text
 */

/**
 * @typedef { TextPosition | ChangeParamsPosition | NoChangeParamsPosition | InvokeApiPosition | DontInvokeApiPosition |
 *    OfferFilterPosition | NoChangeOfferFilterPosition | InvokeApiPosition } Position
 */

/**
 * @typedef {{ question: Handle<'Question'> } & (
 *   { outcome: 'win', position: Position } |
 *   { outcome: 'fail', reason: 'No quorum' }
 * )} OutcomeRecord
 */

/**
 * @typedef {{ question: Handle<'Question'> } & (
 *  { outcome: 'win', positions: Position[] } |
 *  { outcome: 'fail', reason: 'No quorum' }
 * )} MultiOutcomeRecord
 */

/**
 * Specification when requesting creation of a Question
 *
 * @template {Issue} [I=Issue]
 * @typedef {object} QuestionSpec
 * @property {ChoiceMethod} method
 * @property {I} issue
 * @property {Position[]} positions
 * @property {ElectionType} electionType
 * @property {number} maxChoices
 * @property {number} maxWinners
 * @property {ClosingRule} closingRule
 * @property {QuorumRule} quorumRule
 * @property {Position} tieOutcome
 */

/**
 * @typedef {object} QuestionDetailsExtraProperties
 * @property {Instance} counterInstance - instance of the VoteCounter
 * @property {Handle<'Question'>} questionHandle
 */

/**
 * @typedef {QuestionSpec & QuestionDetailsExtraProperties} QuestionDetails
 *    complete question details: questionSpec plus counter and questionHandle
 */

/**
 * @typedef {object} GovernancePair
 * @property {Instance} governor
 * @property {Instance} governed
 */

/**
 * @typedef {object} Question
 * @property {() => Instance} getVoteCounter
 * @property {() => QuestionDetails} getDetails
 */

/**
 * @typedef {object} CompleteUnrankedQuestion
 * @property {Handle<'Question'>} questionHandle
 * @property {Position[]} chosen - a list of equal-weight preferred positions
 */

// not yet in use
/**
 * @typedef {object} CompleteWeightedBallot
 * @property {Handle<'Question'>} questionHandle
 * @property {[Position,bigint][]} weighted - list of positions with
 *   weights. VoteCounter may limit weights to a range or require uniqueness.
 */

// not yet in use
/**
 * @typedef {object} CompleteOrderedBallot
 * @property {Handle<'Question'>} questionHandle
 * @property {Position[]} ordered - ordered list of position from most preferred
 *   to least preferred
 */

/**
 * @typedef {object} PositionCount
 * @property {Position} position
 * @property {bigint} total
 */

/**
 * @typedef {object} VoteStatistics
 * @property {bigint} spoiled
 * @property {number} votes
 * @property {PositionCount[]} results
 */

/**
 * @typedef {object} QuorumCounter
 * @property {(stats: VoteStatistics) => boolean} check
 */

/**
 * @callback BuildQuestion
 * @param {QuestionSpec} questionSpec
 * @param {Instance} instance - voteCounter instance
 * @returns {Question}
 */

/**
 * @typedef {object} VoteCounterCreatorFacet - a facet that the Electorate should
 *   hold tightly. submitVote() is the core capability that allows the holder to
 *   specify the identity and choice of a voter. The voteCounter is making that
 *   available to the Electorate, which should wrap and attenuate it so each
 *   voter gets only the ability to cast their own vote at a weight specified by
 *   the electorate.
 * @property {SubmitVote} submitVote
 */

/**
 * @typedef {object} VoteCounterPublicFacet
 * @property {() => boolean} isOpen
 * @property {() => Question} getQuestion
 * @property {() => Promise<Position>} getOutcome
 * @property {() => QuestionDetails} getDetails
 * @property {() => Promise<VoteStatistics>} getStats
 */

/**
 * @typedef {object} MultiVoteCounterPublicFacet
 * @property {() => boolean} isOpen
 * @property {() => Question} getQuestion
 * @property {() => Promise<Position[]>} getOutcome
 * @property {() => QuestionDetails} getDetails
 * @property {() => Promise<VoteStatistics>} getStats
 */

/**
 * @typedef {object} VoteCounterCloseFacet
 *   TEST ONLY: Should not be allowed to escape from contracts
 * @property {() => void} closeVoting
 */

/**
 * @typedef {object} VoteCounterFacets
 * @property {VoteCounterPublicFacet} publicFacet
 * @property {VoteCounterCreatorFacet} creatorFacet
 * @property {VoteCounterCloseFacet} closeFacet
 */

/**
 * @typedef {object} MultiVoteCounterFacets
 * @property {MultiVoteCounterPublicFacet} publicFacet
 * @property {VoteCounterCreatorFacet} creatorFacet
 * @property {VoteCounterCloseFacet} closeFacet
 */

/**
 * @callback BuildVoteCounter
 * @param {QuestionSpec} questionSpec
 * @param {bigint} threshold - questionSpec includes quorumRule; the electorate
 *    converts that to a number that the counter can enforce.
 * @param {Instance} instance
 * @param {ERef<Publisher<OutcomeRecord>>} publisher
 * @returns {VoteCounterFacets}
 */

/**
 * @callback BuildMultiVoteCounter
 * @param {QuestionSpec} questionSpec
 * @param {bigint} threshold - questionSpec includes quorumRule; the electorate
 *    converts that to a number that the counter can enforce.
 * @param {Instance} instance
 * @param {ERef<Publisher<MultiOutcomeRecord>>} publisher
 * @returns {MultiVoteCounterFacets}
 */

/**
 * @typedef {object} CompletedBallet
 * @property {Position} chosen
 * @property {bigint} shares
 */

/**
 * @callback SubmitVote
 * @param {Handle<'Voter'>} voterHandle
 * @param {Position[]} chosenPositions
 * @param {bigint} [weight]
 * @returns {CompletedBallet}
 */

/**
 * @callback GetOpenQuestions
 * @returns {Promise<Handle<'Question'>[]>}
 */

/**
 * @callback GetQuestion
 * @param {Handle<'Question'>} h
 * @returns {Promise<Question>}
 */

/**
 * @typedef {object} ElectoratePublic
 * @property {() => Subscriber<QuestionDetails>} getQuestionSubscriber
 * @property {GetOpenQuestions} getOpenQuestions,
 * @property {() => Instance} getInstance
 * @property {GetQuestion} getQuestion
 */

/**
 * @typedef { ElectoratePublic & {makeVoterInvitation: () => ERef<Invitation>} } ClaimsElectoratePublic
 * @typedef { ElectoratePublic & {getName: () => string} } CommitteeElectoratePublic
 */

/**
 * @typedef {object} PoserFacet
 * @property {AddQuestion} addQuestion
 */

/**
 * @typedef {object} ElectorateCreatorFacet
 * @property {AddQuestion} addQuestion can be used directly when the creator doesn't need any
 *  reassurance. When someone needs to connect addQuestion to the Electorate
 *  instance, getPoserInvitation() lets them get addQuestion with assurance.
 * @property {() => Promise<Invitation>} getPoserInvitation
 * @property {() => Subscriber<QuestionDetails>} getQuestionSubscriber
 * @property {() => ElectoratePublic} getPublicFacet
 */

/**
 * @typedef {object} GetVoterInvitations
 * @property {() => Invitation[]} getVoterInvitations
 */

/**
 * @typedef {object} VoterFacet - a facet that the Electorate should hold
 *   tightly. It allows specification of the vote's weight, so the Electorate
 *   should distribute an attenuated wrapper that doesn't make that available!
 * @property {SubmitVote} submitVote
 */

/**
 * @typedef {object} ClosingRule
 * @property {ERef<import('@agoric/time').TimerService>} timer
 * @property {import('@agoric/time').Timestamp} deadline
 */

/**
 * @callback CloseVoting
 * @param {ClosingRule} closingRule
 * @param {() => void} closeVoting
 */

/**
 * @typedef {object} AddQuestionReturn
 * @property {VoteCounterPublicFacet} publicFacet
 * @property {VoteCounterCreatorFacet} creatorFacet
 * @property {import('@agoric/zoe/src/zoeService/utils.js').Instance<typeof import('./binaryVoteCounter.js').start>} instance
 * @property {import('@agoric/time').Timestamp} deadline
 * @property {Handle<'Question'>} questionHandle
 */

/**
 * @callback AddQuestion
 * @param {ERef<Installation>} voteCounter
 * @param {QuestionSpec} questionSpec
 * @returns {Promise<AddQuestionReturn>}
 */

/**
 * @callback CreateQuestion
 *
 * @param {string} name - The name of the parameter to change
 * @param {ParamValue} proposedValue - the proposed value for the named
 *   parameter
 * @param {Installation} voteCounterInstallation - the voteCounter to
 *   instantiate to count votes. Expected to be a binaryVoteCounter. Other
 *   voteCounters might be added here, or might require separate governors.
 *   under management so users can trace it back and see that it would use
 *   this electionManager to manage parameters
 * @param {Instance} contractInstance - include the instance of the contract
 * @param {ClosingRule} closingRule - deadline and timer for closing voting
 * @returns {Promise<QuestionDetails>}
 */

/**
 * @template [P=StandardParamPath] path for a paramManagerRetriever
 * @typedef {object} ParamChangeIssue
 * @property {ParamChangesSpec<P>} spec
 * @property {import('@agoric/zoe/src/zoeService/utils.js').Instance<(zcf: ZCF<GovernanceTerms<{}>>) => {}>} contract
 */

/**
 * @typedef {object} ApiInvocationIssue
 * @property {string} apiMethodName
 * @property {unknown[]} methodArgs
 */

/**
 * @typedef {object} OfferFilterIssue
 * @property {string[]} strings
 */

/**
 * @typedef {object} ParamChangePositions
 * @property {ChangeParamsPosition} positive
 * @property {NoChangeParamsPosition} negative
 */

/**
 * @typedef {object} ParamChangeIssueDetails
 *    details for a question that can change a contract parameter
 * @property {ChoiceMethod} method
 * @property {ParamChangeIssue<unknown>} issue
 * @property {ParamChangePositions} positions
 * @property {ElectionType} electionType
 * @property {number} maxChoices
 * @property {ClosingRule} closingRule
 * @property {QuorumRule} quorumRule
 * @property {NoChangeParamsPosition} tieOutcome
 * @property {Instance} counterInstance - instance of the VoteCounter
 * @property {Handle<'Question'>} questionHandle
 */

/**
 * @typedef {Record<Keyword, ParamValueTyped>} ParamStateRecord a Record containing
 *   keyword pairs with descriptions of parameters under governance.
 */

/** @typedef {{current: ParamStateRecord}} GovernanceSubscriptionState */

/**
 * @typedef {object} ParamManagerBase The base paramManager with typed getters
 * @property {() => ERef<ParamStateRecord>} getParams
 * @property {(name: string) => Amount} getAmount
 * @property {(name: string) => Brand} getBrand
 * @property {(name: string) => Instance} getInstance
 * @property {(name: string) => Installation} getInstallation
 * @property {(name: string) => Amount<'set'>} getInvitationAmount
 * @property {(name: string) => bigint} getNat
 * @property {(name: string) => Ratio} getRatio
 * @property {(name: string) => string} getString
 * @property {(name: string) => import('@agoric/time').TimestampRecord} getTimestamp
 * @property {(name: string) => import('@agoric/time').RelativeTimeRecord} getRelativeTime
 * @property {(name: string) => any} getUnknown
 * @property {(name: string, proposedValue: ParamValue) => ParamValue} getVisibleValue - for
 *   most types, the visible value is the same as proposedValue. For Invitations
 *   the visible value is the amount of the invitation.
 * @property {(name: string) => Promise<Invitation>} getInternalParamValue
 * @property {() => StoredSubscription<GovernanceSubscriptionState>} getSubscription
 */

/**
 * @callback UpdateParams
 * @param {Record<string,ParamValue>} paramChanges
 * @returns {Promise<void>}
 */

/**
 * These are typed `any` because the builder pattern of paramManager makes it very
 * complicated for the type system to know the set of param-specific functions
 * returned by `.build()`. Instead we let paramManager create the desired methods
 * and use typedParamManager to create a version that includes the static types.
 *
 * @typedef {Record<string, any>} ParamManagerGettersAndUpdaters
 * @typedef {ParamManagerBase & ParamManagerGettersAndUpdaters & {updateParams: UpdateParams}} AnyParamManager
 */

/**
 * @typedef {Record<string, string[]>} ParameterNameList
 */

/**
 * @callback AssertParamManagerType
 * @param {ParamType} type
 * @param {ParamValue} value
 * @param {string} name
 */

/**
 * @callback BuildParamManager - ParamManager is a facility that governed
 *   contracts can use to manage their visible state in a way that allows the
 *   ContractGovernor to update values using governance. When paramManager is
 *   instantiated inside the contract, the contract has synchronous access to
 *   the values, and clients of the contract can verify that a ContractGovernor
 *   can change the values in a legible way.
 * @param {Iterable<ParamValueTyped>} paramDescriptions
 * @returns {AnyParamManager}
 */

/**
 * @typedef {object} ChangeParamsPosition
 * @property {Record<string,ParamValue>} changes one or more changes to parameters
 */

/**
 * @typedef {object} OfferFilterPosition
 * @property {string[]} strings
 */

/**
 * @typedef {object} NoChangeOfferFilterPosition
 * @property {string[]} dontUpdate
 */

/**
 * @typedef {object} InvokeApiPosition
 * @property {string} apiMethodName
 * @property {unknown[]} methodArgs
 */

/**
 * @typedef {object} DontInvokeApiPosition
 * @property {string} dontInvoke
 */

/**
 * @typedef {object} NoChangeParamsPosition
 * @property {string[]} noChange Parameters in the proposal that this position
 *   is opposed to
 */

/**
 * @typedef {object} Governor
 * @property {CreateQuestion} createQuestion
 */

/** @typedef {{ [methodName: string]: (...args: any) => unknown }} GovernedApis */

/**
 * @typedef {object} GovernorPublic
 * @property {() => Promise<Instance>} getElectorate
 * @property {() => Instance} getGovernedContract
 * @property {(voteCounter: Instance) => Promise<void>} validateVoteCounter
 * @property {(regP: ERef<Instance>) => Promise<void>} validateElectorate
 * @property {(closingRule: ClosingRule) => void} validateTimer
 */

/**
 * @typedef {object} ParamKey identifier for a paramManager within a contract
 * @property {unknown} key
 */

/**
 * Description of a set of coordinated changes for a ParamManager
 *
 * @template P path for a paramManagerRetriever
 * @typedef {object} ParamChangesSpec<P>
 * @property {P} paramPath
 * @property {Record<string, ParamValue>} changes one or more changes to parameters
 */

/**
 * @typedef {object} ContractGovernanceVoteResult
 * @property {Instance} instance - instance of the VoteCounter
 * @property {ERef<QuestionDetails>} details
 * @property {Promise<ParamValue>} outcomeOfUpdate - A promise for the result
 *    of updating the parameter value. Primarily useful for its behavior on
 *    rejection.
 */

/**
 * @template {GovernableStartFn} SF Start function of governed contract
 * @typedef {object} GovernorCreatorFacet
 * @property {VoteOnParamChanges} voteOnParamChanges
 * @property {VoteOnApiInvocation} voteOnApiInvocation
 * @property {VoteOnOfferFilter} voteOnOfferFilter
 * @property {() => LimitedCF<SF>} getCreatorFacet facet of the governed contract,
 *   with creator-like powers but without the tightly held ability to change
 *   param values.
 * @property {(poserInvitation: Invitation) => Promise<void>} replaceElectorate
 * @property {() => AdminFacet<SF>} getAdminFacet
 * @property {() => GovernedPublicFacet<Awaited<ReturnType<SF>>['publicFacet']>} getPublicFacet - public facet of the governed contract
 * @property {() => Instance} getInstance - instance of the governed
 *   contract
 */

/**
 * @typedef GovernedPublicFacetMethods
 * @property {(key?: any) => StoredSubscription<GovernanceSubscriptionState>} getSubscription
 * @property {(key?: any) => ERef<ParamStateRecord>} getGovernedParams - get descriptions of
 *   all the governed parameters
 * @property {(name: string) => Amount} getInvitationAmount
 */

/**
 * @template {{}} PF Public facet
 * @typedef {PF & GovernedPublicFacetMethods} GovernedPublicFacet
 */

/**
 * @template {GovernableStartFn} SF
 * @typedef {ReturnType<Awaited<ReturnType<SF>>['creatorFacet']['getLimitedCreatorFacet']>} LimitedCF
 */

/**
 * @template {{}} CF creator facet
 * @typedef GovernedCreatorFacet
 * What a governed contract must return as its creatorFacet in order to be governed
 * @property {() => ParamManagerRetriever} getParamMgrRetriever - allows accessing
 *   and updating governed parameters. Should only be directly accessible to the
 *   contractGovernor
 * @property {() => ERef<CF>} getLimitedCreatorFacet - the creator
 *   facet of the governed contract. Doesn't provide access to any governance
 *   functionality
 * @property {(name: string) => Promise<Invitation>} getInvitation
 * @property {() => ERef<GovernedApis>} getGovernedApis
 * @property {() => (string | symbol)[]} getGovernedApiNames
 * @property {(strings: string[]) => void} setOfferFilter
 */

/**
 * @typedef {{key: string}} StandardParamPath
 */

/**
 * @typedef {object} ParamManagerRetriever
 * @property {(paramKey?: ParamKey) => AnyParamManager} get
 */

/**
 * @template [P=StandardParamPath]
 *
 * @callback VoteOnParamChanges
 * @param {Installation} voteCounterInstallation
 * @param {import('@agoric/time').Timestamp} deadline
 * @param {ParamChangesSpec<P>} paramSpec
 * @returns {Promise<ContractGovernanceVoteResult>}
 */

/**
 * @callback VoteOnApiInvocation
 * @param {string} apiMethodName
 * @param {unknown[]} methodArgs
 * @param {Installation} voteCounterInstallation
 * @param {import('@agoric/time').Timestamp} deadline
 * @returns {Promise<ContractGovernanceVoteResult>}
 */

/**
 * @callback VoteOnOfferFilter
 * @param {Installation} voteCounterInstallation
 * @param {import('@agoric/time').Timestamp} deadline
 * @param {string[]} strings
 * @returns {Promise<ContractGovernanceVoteResult>}
 */

/**
 * @typedef {object} ParamGovernor
 * @property {VoteOnParamChanges} voteOnParamChanges
 * @property {CreatedQuestion} createdQuestion
 */

/**
 * @typedef {object} ApiGovernor
 * @property {VoteOnApiInvocation} voteOnApiInvocation
 * @property {CreatedQuestion} createdQuestion
 */

/**
 * @typedef {object} FilterGovernor
 * @property {VoteOnOfferFilter} voteOnFilter
 * @property {CreatedQuestion} createdQuestion
 */

/**
 * @callback CreatedQuestion
 *   Was this question created by this ContractGovernor?
 * @param {Instance} questionInstance
 * @returns {boolean}
 */

/**
 * @callback PositionIncluded
 * @param {Position[]} positions
 * @param {Position} position
 * @returns {boolean}
 */

/**
 * @typedef {object} GovernedContractTerms
 * @property {import('@agoric/time').TimerService} timer
 * @property {IssuerKeywordRecord} issuerKeywordRecord
 * @property {object} privateArgs
 */

/**
 * @callback AssertContractGovernance
 *
 * @param {ERef<ZoeService>} zoe
 * @param {import('@agoric/zoe/src/zoeService/utils.js').Instance<(zcf: ZCF<GovernanceTerms<{}>>) => {}>} allegedGoverned
 * @param {Instance} allegedGovernor
 * @param {Installation<import('@agoric/governance/src/contractGovernor.js').start>} contractGovernorInstallation
 * @returns {Promise<GovernancePair>}
 */

/**
 * @callback AssertContractElectorate - assert that the contract uses the
 *   electorate
 *
 * @param {ERef<ZoeService>} zoe
 * @param {Instance} allegedGovernor
 * @param {Instance} allegedElectorate
 */

/**
 * @typedef {ContractStartFunction
 * & ((zcf?: any, pa?: any, baggage?: any) => ERef<{creatorFacet: GovernedCreatorFacet<{}>, publicFacet: GovernedPublicFacet<{}>}>)} GovernableStartFn
 */

/**
 * @typedef {import('./contractGovernor.js')['start']} GovernorSF
 */

// TODO find a way to parameterize the startInstance so the governed contract types flow
/**
 * @see {StartedInstanceKit}
 * @template {ERef<Installation<GovernableStartFn>>} I
 * @typedef GovernorStartedInstallationKit
 * Same result as StartedInstanceKit but:
 * - typed for contractGovernor installation being started by Zoe. (It in turn starts the governed contract.)
 * - parameterized by Installation instead of StartFunction
 * @property {import('@agoric/zoe/src/zoeService/utils.js').Instance<GovernorSF>} instance
 * @property {AdminFacet<any>} adminFacet
 * @property {GovernorCreatorFacet<InstallationStart<Awaited<I>>>} creatorFacet
 * @property {GovernorPublic} publicFacet
 */

/**
 * @see {StartedInstanceKit}
 * @template {GovernableStartFn} SF
 * @typedef GovernanceFacetKit
 * Akin to StartedInstanceKit but designed for the results of starting governed contracts. Used in bootstrap space.
 * @property {AdminFacet<GovernableStartFn>} adminFacet of the governed contract
 * @property {LimitedCF<SF>} creatorFacet creator-like facet within the governed contract (without the powers the governor needs)
 * @property {GovernorCreatorFacet<SF>} governorCreatorFacet of the governing contract
 * @property {AdminFacet<any>} governorAdminFacet of the governing contract
 * @property {Awaited<ReturnType<SF>>['publicFacet']} publicFacet
 * @property {Instance} instance
 * @property {Instance} governor
 */
