import { Fail, q } from '@agoric/assert';
import { AmountMath } from '@agoric/ertp';
import { makeTracer } from '@agoric/internal';
import { TimeMath, TimestampShape } from '@agoric/time';
import { M, makeScalarBigMapStore, prepareExoClassKit } from '@agoric/vat-data';
import {
  calculateMedian,
  natSafeMath,
} from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { isNat, Nat } from '@endo/nat';
import { UnguardedHelperI } from '@agoric/internal/src/typeGuards.js';

const { add, subtract, multiply, floorDivide, ceilDivide, isGTE } = natSafeMath;

/** @import {OracleStatus} from './priceOracleKit.js' */
/**
 * @import {Timestamp} from '@agoric/time'
 * @import {TimerService} from '@agoric/time'
 * @import {PriceQuery, PriceQuoteValue} from '@agoric/zoe';
 */

/** @type {string} */
const V3_NO_DATA_ERROR = 'No data present';

/** @type {bigint} */
export const ROUND_MAX = BigInt(2 ** 32 - 1);

const trace = makeTracer('RoundsM', false);

/** @param {bigint} roundId */
const validRoundId = roundId => {
  return roundId <= ROUND_MAX;
};

/**
 * @typedef {{ roundId: number | undefined; unitPrice: NatValue }} PriceRound
 *
 * @typedef {Pick<RoundData, 'roundId' | 'startedAt'> & { startedBy: string }} LatestRound
 */

/** @typedef {Round & { roundId: bigint }} RoundData */

/**
 * @typedef {object} Round
 * @property {bigint} answer the answer for the given round
 * @property {Timestamp} startedAt the timestamp when the round was started.
 *   This is 0 if the round hasn't been started yet.
 * @property {Timestamp} updatedAt the timestamp when the round last was updated
 *   (i.e. answer was last computed)
 * @property {bigint} answeredInRound the round ID of the round in which the
 *   answer was computed. answeredInRound may be smaller than roundId when the
 *   round timed out. answeredInRound is equal to roundId when the round didn't
 *   time out and was completed regularly.
 */

/**
 * @typedef {object} RoundDetails
 * @property {bigint[]} submissions
 * @property {number} maxSubmissions
 * @property {number} minSubmissions
 * @property {number} roundTimeout
 */

/** @typedef {IssuerKit<'set'>} QuoteKit */

/**
 * @typedef {Readonly<
 *   import('./fluxAggregatorKit.js').ChainlinkConfig & {
 *     quoteKit: QuoteKit;
 *     answerPublisher: Publisher<void>;
 *     brandIn: Brand<'nat'>;
 *     brandOut: Brand<'nat'>;
 *     latestRoundPublisher: import('@agoric/zoe/src/contractSupport/recorder.js').Recorder<LatestRound>;
 *     timerPresence: TimerService;
 *   }
 * >} HeldParams
 *
 * @typedef {Readonly<
 *   HeldParams & {
 *     details: MapStore<bigint, RoundDetails>;
 *     rounds: MapStore<bigint, Round>;
 *     unitIn: bigint;
 *   }
 * >} ImmutableState
 *
 * @typedef {{
 *   lastValueOutForUnitIn: bigint?;
 *   reportingRoundId: bigint;
 * }} MutableState
 */
/** @typedef {ImmutableState & MutableState} State */

export const prepareRoundsManagerKit = baggage =>
  prepareExoClassKit(
    baggage,
    'RoundsManager',
    {
      helper: UnguardedHelperI,
      contract: M.interface('contract', {
        authenticateQuote: M.call([M.record()]).returns(M.any()),
        makeCreateQuote: M.call()
          .optional({
            overrideValueOut: M.number(),
            timestamp: TimestampShape,
          })
          .returns(M.any()),
        eligibleForSpecificRound: M.call(
          M.any(),
          M.bigint(),
          TimestampShape,
        ).returns(M.boolean()),
        getRoundData: M.call(M.any()).returns(M.promise()),
        getRoundStatus: M.call(M.bigint()).returns(M.record()),
        oracleRoundStateSuggestRound: M.call(M.any(), TimestampShape).returns(
          M.record(),
        ),
      }),
      oracle: M.interface('oracle', {
        handlePush: M.call(M.record(), M.record()).returns(M.promise()),
      }),
    },
    /**
     * @type {(
     *   opts: HeldParams & { unitAmountIn: Amount<'nat'> },
     * ) => State}
     */
    ({
      // ChainlinkConfig
      maxSubmissionCount,
      minSubmissionCount,
      restartDelay,
      minSubmissionValue,
      maxSubmissionValue,
      timeout,
      // other HeldParams
      quoteKit,
      answerPublisher,
      brandIn,
      brandOut,
      latestRoundPublisher,
      timerPresence,
      // other option
      unitAmountIn,
    }) => {
      const unitIn = AmountMath.getValue(brandIn, unitAmountIn);

      const rounds = makeScalarBigMapStore('rounds', { durable: true });

      const details = makeScalarBigMapStore('details', { durable: true });

      /** @type {ImmutableState} */
      const immutable = {
        // ChainlinkConfig
        maxSubmissionCount,
        minSubmissionCount,
        restartDelay,
        minSubmissionValue,
        maxSubmissionValue,
        timeout,
        // other HeldParams
        quoteKit,
        answerPublisher,
        brandIn,
        brandOut,
        latestRoundPublisher,
        timerPresence,
        // computed
        details,
        rounds,
        unitIn,
      };
      return {
        ...immutable,
        lastValueOutForUnitIn: null,
        reportingRoundId: 0n,
      };
    },
    {
      helper: {
        /** @param {bigint} roundId */
        acceptingSubmissions(roundId) {
          const { details } = this.state;
          return (
            details.has(roundId) && details.get(roundId).maxSubmissions !== 0
          );
        },

        /**
         * @param {OracleStatus} status
         * @param {bigint} roundId
         */
        delayed(status, roundId) {
          const { restartDelay } = this.state;
          const lastStarted = status.lastStartedRound;
          return roundId > add(lastStarted, restartDelay) || lastStarted === 0n;
        },

        /** @param {bigint} roundId */
        deleteRoundDetails(roundId) {
          const { details } = this.state;
          const roundDetails = details.get(roundId);
          if (roundDetails.submissions.length < roundDetails.maxSubmissions)
            return;
          details.delete(roundId);
        },

        /** @param {bigint} roundId */
        isNextRound(roundId) {
          const { reportingRoundId } = this.state;
          return roundId === add(reportingRoundId, 1);
        },

        /**
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         * @param {string} oracleId
         */
        initializeNewRound(roundId, blockTimestamp, oracleId) {
          const {
            details,
            latestRoundPublisher,
            minSubmissionCount,
            maxSubmissionCount,
            rounds,
            timeout,
          } = this.state;
          const { helper } = this.facets;
          helper.isNextRound(roundId) || Fail`Round ${roundId} already started`;

          helper.updateTimedOutRoundInfo(subtract(roundId, 1), blockTimestamp);

          this.state.reportingRoundId = roundId;

          details.init(
            roundId,
            harden({
              submissions: [],
              maxSubmissions: maxSubmissionCount,
              minSubmissions: minSubmissionCount,
              roundTimeout: timeout,
            }),
          );

          const round = harden({
            answer: 0n,
            startedAt: blockTimestamp,
            updatedAt: 0n,
            answeredInRound: 0n,
          });
          rounds.init(roundId, round);
          // assume it succeeds. if not, expect the next to.
          // if it fails continuously it'll be apparent in the unhandled rejection logging.
          void latestRoundPublisher.write({
            roundId,
            startedAt: round.startedAt,
            startedBy: oracleId,
          });
        },

        /**
         * @param {bigint} roundId
         * @param {bigint} rrId reporting round ID
         */
        previousAndCurrentUnanswered(roundId, rrId) {
          const { rounds } = this.state;
          return add(roundId, 1) === rrId && rounds.get(rrId).updatedAt === 0n;
        },

        /**
         * @param {bigint} roundId
         * @param {OracleStatus} status
         * @param {Timestamp} blockTimestamp
         * @returns {OracleStatus | undefined} the new status
         */
        proposeNewRound(roundId, status, blockTimestamp) {
          const { helper } = this.facets;
          if (!helper.isNextRound(roundId)) return undefined;
          const { restartDelay } = this.state;
          const lastStarted = status.lastStartedRound; // cache storage reads
          if (roundId <= add(lastStarted, restartDelay) && lastStarted !== 0n)
            return undefined;
          helper.initializeNewRound(roundId, blockTimestamp, status.oracleId);

          return harden({
            ...status,
            lastStartedRound: roundId,
          });
        },

        /**
         * @param {bigint} submission
         * @param {bigint} roundId
         * @param {OracleStatus} status
         * @returns {OracleStatus} the new status
         */
        recordSubmission(submission, roundId, status) {
          trace('recordSubmission', submission, roundId, status);
          const { helper } = this.facets;
          const { details } = this.state;
          helper.acceptingSubmissions(roundId) ||
            Fail`round ${q(
              Number(roundId),
            )} not accepting submissions from oracle ${q(status.oracleId)}`;

          const lastRoundDetails = details.get(roundId);
          details.set(roundId, {
            ...lastRoundDetails,
            submissions: [...lastRoundDetails.submissions, submission],
          });

          return {
            ...status,
            lastReportedRound: roundId,
            latestSubmission: submission,
          };
        },

        /**
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         */
        supersedable(roundId, blockTimestamp) {
          const { rounds } = this.state;
          const { helper } = this.facets;
          return (
            rounds.has(roundId) &&
            (TimeMath.absValue(rounds.get(roundId).updatedAt) > 0n ||
              helper.timedOut(roundId, blockTimestamp))
          );
        },
        /**
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         */
        timedOut(roundId, blockTimestamp) {
          const { details, rounds } = this.state;
          if (!details.has(roundId) || !rounds.has(roundId)) {
            return false;
          }

          const startedAt = rounds.get(roundId).startedAt;
          const roundTimeout = details.get(roundId).roundTimeout;
          // TODO Better would be to make `roundTimeout` a `RelativeTime`
          // everywhere, and to rename it to a name that does not
          // mistakenly imply that it is an absolute time.
          const roundTimeoutDuration = TimeMath.relValue(BigInt(roundTimeout));
          const roundTimedOut =
            TimeMath.absValue(startedAt) > 0n &&
            TimeMath.relValue(roundTimeoutDuration) > 0n &&
            TimeMath.compareAbs(
              TimeMath.addAbsRel(startedAt, roundTimeoutDuration),
              blockTimestamp,
            ) < 0;

          return roundTimedOut;
        },

        /**
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         */
        updateRoundAnswer(roundId, blockTimestamp) {
          const { answerPublisher, details, rounds } = this.state;
          const roundDetails = details.get(roundId);
          if (roundDetails.submissions.length < roundDetails.minSubmissions) {
            return [false, 0];
          }

          /** @type {bigint | undefined} */
          // @ts-expect-error faulty inference
          const newAnswer = calculateMedian(
            roundDetails.submissions.filter(
              sample => isNat(sample) && sample > 0n,
            ),
            { add, divide: floorDivide, isGTE },
          );

          assert(newAnswer, 'insufficient samples');

          rounds.set(roundId, {
            ...rounds.get(roundId),
            answer: newAnswer,
            updatedAt: blockTimestamp,
            answeredInRound: roundId,
          });

          this.state.lastValueOutForUnitIn = newAnswer;
          answerPublisher.publish(undefined);

          return [true, newAnswer];
        },
        /**
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         */
        updateTimedOutRoundInfo(roundId, blockTimestamp) {
          const { details, rounds } = this.state;
          const { helper } = this.facets;

          // round 0 is non-existent, so we avoid that case -- round 1 is ignored
          // because we can't copy from round 0 in that case
          if (roundId === 0n || roundId === 1n) {
            return;
          }

          const roundTimedOut = helper.timedOut(roundId, blockTimestamp);
          if (!roundTimedOut) return;

          const prevRound = rounds.get(subtract(roundId, 1));

          rounds.set(roundId, {
            ...rounds.get(roundId),
            answer: prevRound.answer,
            answeredInRound: prevRound.answeredInRound,
            updatedAt: blockTimestamp,
          });

          details.delete(roundId);
        },

        /**
         * @param {OracleStatus} status
         * @param {bigint} roundId
         * @param {Timestamp} blockTimestamp
         * @returns {string | null} error message, if there is one
         */
        validateOracleRound(status, roundId, blockTimestamp) {
          const { reportingRoundId } = this.state;
          const { helper } = this.facets;

          let canSupersede = true;
          if (roundId > 1n) {
            canSupersede = helper.supersedable(
              subtract(roundId, 1),
              blockTimestamp,
            );
          }

          if (status.lastReportedRound >= roundId) {
            return 'cannot report on previous rounds';
          }

          if (
            roundId !== reportingRoundId &&
            roundId !== add(reportingRoundId, 1) &&
            !helper.previousAndCurrentUnanswered(roundId, reportingRoundId)
          )
            return 'invalid round to report';
          if (roundId !== 1n && !canSupersede)
            return 'previous round not supersedable';
          return null;
        },
      },
      contract: {
        /** @param {PriceQuoteValue} quote */
        async authenticateQuote(quote) {
          const { quoteKit } = this.state;
          const quoteAmount = AmountMath.make(quoteKit.brand, harden(quote));
          const quotePayment = await E(quoteKit.mint).mintPayment(quoteAmount);
          return harden({ quoteAmount, quotePayment });
        },

        /**
         * @param {object} param0
         * @param {number} [param0.overrideValueOut]
         * @param {Timestamp} [param0.timestamp]
         */
        makeCreateQuote({ overrideValueOut, timestamp } = {}) {
          const { state } = this;
          const { brandIn, brandOut, timerPresence } = state;
          const { contract } = this.facets;

          /** @param {PriceQuery} priceQuery */
          return Far('createQuote', priceQuery => {
            const { lastValueOutForUnitIn, unitIn } = state;

            // Sniff the current baseValueOut.
            const valueOutForUnitIn =
              overrideValueOut === undefined
                ? lastValueOutForUnitIn // Use the latest value.
                : overrideValueOut; // Override the value.
            if (valueOutForUnitIn === null) {
              // We don't have a quote, so abort.
              return undefined;
            }

            /** @param {Amount<'nat'>} amountIn the given amountIn */
            const calcAmountOut = amountIn => {
              const valueIn = AmountMath.getValue(brandIn, amountIn);
              return AmountMath.make(
                brandOut,
                floorDivide(multiply(valueIn, valueOutForUnitIn), unitIn),
              );
            };

            /** @param {Amount<'nat'>} amountOut the wanted amountOut */
            const calcAmountIn = amountOut => {
              const valueOut = AmountMath.getValue(brandOut, amountOut);
              return AmountMath.make(
                brandIn,
                ceilDivide(multiply(valueOut, unitIn), valueOutForUnitIn),
              );
            };

            // Calculate the quote.
            const quote = priceQuery(calcAmountOut, calcAmountIn);
            if (!quote) {
              return undefined;
            }

            const {
              amountIn,
              amountOut,
              timestamp: theirTimestamp = timestamp,
            } = quote;
            AmountMath.coerce(brandIn, amountIn);
            AmountMath.coerce(brandOut, amountOut);
            if (theirTimestamp !== undefined) {
              return contract.authenticateQuote([
                {
                  amountIn,
                  amountOut,
                  timer: timerPresence,
                  timestamp: theirTimestamp,
                },
              ]);
            }
            return E(timerPresence)
              .getCurrentTimestamp()
              .then(now =>
                contract.authenticateQuote([
                  { amountIn, amountOut, timer: timerPresence, timestamp: now },
                ]),
              );
          });
        },

        /**
         * @param {OracleStatus} status
         * @param {bigint} queriedRoundId
         * @param {Timestamp} blockTimestamp
         */
        eligibleForSpecificRound(status, queriedRoundId, blockTimestamp) {
          const { rounds } = this.state;
          const { helper } = this.facets;
          const error = helper.validateOracleRound(
            status,
            queriedRoundId,
            blockTimestamp,
          );
          if (TimeMath.absValue(rounds.get(queriedRoundId).startedAt) > 0n) {
            return (
              helper.acceptingSubmissions(queriedRoundId) && error === null
            );
          } else {
            return helper.delayed(status, queriedRoundId) && error === null;
          }
        },

        /**
         * consumers are encouraged to check that they're receiving fresh data
         * by inspecting the updatedAt and answeredInRound return values.
         *
         * @param {bigint | number} roundIdRaw
         * @returns {Promise<RoundData>}
         */
        async getRoundData(roundIdRaw) {
          const roundId = Nat(roundIdRaw);
          const { rounds } = this.state;

          rounds.has(roundId) || assert.fail(V3_NO_DATA_ERROR);

          const r = rounds.get(roundId);

          assert(
            r.answeredInRound > 0 && validRoundId(roundId),
            V3_NO_DATA_ERROR,
          );

          return {
            roundId,
            answer: r.answer,
            startedAt: r.startedAt,
            updatedAt: r.updatedAt,
            answeredInRound: r.answeredInRound,
          };
        },

        /** @type {(roundId: bigint) => Readonly<RoundDetails & Round>} */
        getRoundStatus(roundId) {
          const { details, rounds } = this.state;
          rounds.has(roundId) || Fail`V3_NO_DATA_ERROR`;
          const detail = details.get(roundId);
          const round = rounds.get(roundId);
          return harden({ ...detail, ...round });
        },

        /**
         * a method to provide all current info oracleStatuses need. Intended
         * only only to be callable by oracleStatuses. Not for use by contracts
         * to read state.
         *
         * @param {OracleStatus} status
         * @param {Timestamp} blockTimestamp
         */
        oracleRoundStateSuggestRound(status, blockTimestamp) {
          const { helper } = this.facets;
          const { details, reportingRoundId, rounds } = this.state;
          const shouldSupersede =
            status.lastReportedRound === reportingRoundId ||
            !helper.acceptingSubmissions(reportingRoundId);
          // Instead of nudging oracleStatuses to submit to the next round, the inclusion of
          // the shouldSupersede Boolean in the if condition pushes them towards
          // submitting in a currently open round.
          const canSupersede = helper.supersedable(
            reportingRoundId,
            blockTimestamp,
          );

          let roundId;
          let eligibleToSubmit;
          if (canSupersede && shouldSupersede) {
            roundId = add(reportingRoundId, 1);
            eligibleToSubmit = helper.delayed(status, roundId);
          } else {
            roundId = reportingRoundId;
            eligibleToSubmit = helper.acceptingSubmissions(roundId);
          }

          let round;
          let startedAt;
          let roundTimeout;
          if (rounds.has(roundId)) {
            round = rounds.get(roundId);
            startedAt = round.startedAt;
            roundTimeout = details.get(roundId).roundTimeout;
          } else {
            startedAt = 0n;
            roundTimeout = 0;
          }

          const error = helper.validateOracleRound(
            status,
            roundId,
            blockTimestamp,
          );
          if (error !== null) {
            eligibleToSubmit = false;
          }

          return {
            eligibleForSpecificRound: eligibleToSubmit,
            queriedRoundId: roundId,
            latestSubmission: status.latestSubmission,
            startedAt,
            roundTimeout,
          };
        },
      },
      oracle: {
        /**
         * push a unitPrice result from this oracle
         *
         * @param {OracleStatus} status
         * @param {PriceRound} result
         */
        async handlePush(
          status,
          { roundId: roundIdRaw = undefined, unitPrice: valueRaw },
        ) {
          trace('handlePush', status, roundIdRaw, valueRaw);
          const value = Nat(valueRaw);
          const { minSubmissionValue, maxSubmissionValue, timerPresence } =
            this.state;

          const { contract, helper } = this.facets;
          value >= minSubmissionValue ||
            Fail`value below minSubmissionValue ${q(minSubmissionValue)}`;
          value <= maxSubmissionValue ||
            Fail`value above maxSubmissionValue ${q(maxSubmissionValue)}`;

          const blockTimestamp = await E(timerPresence).getCurrentTimestamp();
          trace('handlePush blockTimestamp', blockTimestamp.absValue);

          let roundId;
          if (roundIdRaw === undefined) {
            const suggestedRound = contract.oracleRoundStateSuggestRound(
              status,
              blockTimestamp,
            );
            roundId = suggestedRound.eligibleForSpecificRound
              ? suggestedRound.queriedRoundId
              : add(suggestedRound.queriedRoundId, 1);
          } else {
            roundId = Nat(roundIdRaw);
          }

          const errorMsg = helper.validateOracleRound(
            status,
            roundId,
            blockTimestamp,
          );

          if (!(errorMsg === null)) {
            assert.fail(errorMsg);
          }

          const proposedStatus = helper.proposeNewRound(
            roundId,
            status,
            blockTimestamp,
          );
          const settledStatus = helper.recordSubmission(
            value,
            roundId,
            proposedStatus || status,
          );

          helper.updateRoundAnswer(roundId, blockTimestamp);
          helper.deleteRoundDetails(roundId);

          trace('handlePush returning', settledStatus);

          return settledStatus;
        },
      },
    },
  );
