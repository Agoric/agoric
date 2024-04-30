/**
 * @file Adaptation of Chainlink algorithm to the Agoric platform. Modeled on
 *   https://github.com/smartcontractkit/chainlink/blob/master/contracts/src/v0.6/FluxAggregator.sol
 *   (version?)
 */
import { AmountMath } from '@agoric/ertp';
import { assertAllDefined, makeTracer } from '@agoric/internal';
import { makeNotifierFromSubscriber, observeNotifier } from '@agoric/notifier';
import { M, makeScalarBigMapStore, prepareExoClassKit } from '@agoric/vat-data';
import {
  defineRecorderKit,
  makeOnewayPriceAuthorityKit,
  makeRecorderTopic,
  provideAll,
} from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { prepareOracleAdminKit } from './priceOracleKit.js';
import { prepareRoundsManagerKit } from './roundsManager.js';

const trace = makeTracer('FlxAgg', true);

export const INVITATION_MAKERS_DESC = 'oracle invitation';

/**
 * @import {Baggage} from '@agoric/vat-data'
 * @import {Timestamp} from '@agoric/time'
 * @import {RelativeTime} from '@agoric/time'
 *   RelativeTime, not RelativeTimeValue
 * @import {RelativeTimeValue} from '@agoric/time'
 * @import {TimerService} from '@agoric/time'
 * @import {PriceDescription, PriceQuoteValue} from '@agoric/zoe';
 */

/** @type {(quote: PriceQuote) => PriceDescription} */
const priceDescriptionFromQuote = quote => quote.quoteAmount.value[0];

/**
 * @typedef {object} RoundState
 * @property {boolean} eligibleForSpecificRound
 * @property {bigint} queriedRoundId
 * @property {bigint} latestSubmission
 * @property {Timestamp} startedAt
 * @property {number} roundTimeout
 * @property {number} oracleCount
 */

// Partly documented at https://github.com/smartcontractkit/chainlink/blob/b045416ebca769aa69bde2da23b5109abe07a8b5/contracts/src/v0.6/FluxAggregator.sol#L153
/**
 * @typedef {object} ChainlinkConfig
 * @property {number} maxSubmissionCount
 * @property {number} minSubmissionCount
 * @property {bigint} restartDelay the number of rounds an Oracle has to wait
 *   before they can initiate a round
 * @property {number} minSubmissionValue an immutable check for a lower bound of
 *   what submission values are accepted from an oracle
 * @property {number} maxSubmissionValue an immutable check for an upper bound
 *   of what submission values are accepted from an oracle
 * @property {number} timeout the number of seconds after the previous round
 *   that allowed to lapse before allowing an oracle to skip an unfinished
 *   round
 */

/**
 * Returns a maker for a single durable FluxAggregatorKit, closed over the
 * prepare() arguments.
 *
 * The kit aggregates price inputs to produce a PriceAuthority. Unlike the
 * simpler `priceAggregator.js`, this approximates the _Node Operator
 * Aggregation_ logic of [Chainlink price
 * feeds](https://blog.chain.link/levels-of-data-aggregation-in-chainlink-price-feeds/).
 *
 * @param {Baggage} baggage
 * @param {ZCF<
 *   ChainlinkConfig & {
 *     timer: TimerService;
 *     brandIn: Brand<'nat'>;
 *     brandOut: Brand<'nat'>;
 *     unitAmountIn?: Amount<'nat'>;
 *   }
 * >} zcf
 * @param {TimerService} timerPresence
 * @param {import('./roundsManager.js').QuoteKit} quoteKit
 * @param {StorageNode} storageNode
 * @param {() => PublishKit<any>} makeDurablePublishKit
 * @param {import('@agoric/zoe/src/contractSupport/recorder.js').MakeRecorder} makeRecorder
 */
export const prepareFluxAggregatorKit = async (
  baggage,
  zcf,
  timerPresence,
  quoteKit,
  storageNode,
  makeDurablePublishKit,
  makeRecorder,
) => {
  // brands come from named terms instead of `brands` key because the latter is
  // a StandardTerm that Zoe creates from the `issuerKeywordRecord` argument and
  // Oracle brands are inert (without issuers or mints).
  const {
    brandIn,
    brandOut,
    maxSubmissionCount,
    maxSubmissionValue,
    minSubmissionCount,
    minSubmissionValue,
    restartDelay,
    timeout,

    unitAmountIn = AmountMath.make(brandIn, 1n),
  } = zcf.getTerms();

  assertAllDefined({
    brandIn,
    brandOut,
    maxSubmissionCount,
    maxSubmissionValue,
    minSubmissionCount,
    minSubmissionValue,
    restartDelay,
    timeout,
    unitAmountIn,
  });

  const makeRoundsManagerKit = prepareRoundsManagerKit(baggage);
  const makeOracleAdminKit = prepareOracleAdminKit(baggage);

  const makeRecorderKit = defineRecorderKit({
    // @ts-expect-error XXX
    makeDurablePublishKit,
    makeRecorder,
  });

  // end of maker definitions /////////////////////////////////

  const { answerKit, latestRoundKit, priceKit } = await provideAll(baggage, {
    /**
     * This is just a signal that there's a new answer, which is read from
     * `lastValueOutForUnitIn`
     */
    answerKit: () => makeDurablePublishKit(),
    /** For publishing priceAuthority values to off-chain storage */
    priceKit: () =>
      makeRecorderKit(
        storageNode,
        /** @type {import('@agoric/zoe/src/contractSupport/recorder.js').TypedMatcher<PriceDescription>} */ (
          M.any()
        ),
      ),
    latestRoundKit: () =>
      E.when(E(storageNode).makeChildNode('latestRound'), node =>
        makeRecorderKit(
          node,
          /**
           * @type {import('@agoric/zoe/src/contractSupport/recorder.js').TypedMatcher<
           *     import('./roundsManager.js').LatestRound
           *   >}
           */ (M.any()),
        ),
      ),
  });

  const { roundsManagerKit } = await provideAll(baggage, {
    roundsManagerKit: () =>
      makeRoundsManagerKit(
        harden({
          answerPublisher: answerKit.publisher,
          brandIn,
          brandOut,
          latestRoundPublisher: latestRoundKit.recorder,
          minSubmissionCount,
          maxSubmissionCount,
          minSubmissionValue,
          maxSubmissionValue,
          quoteKit,
          restartDelay,
          timerPresence,
          timeout,
          unitAmountIn,
        }),
      ),
  });

  // not durable, held in closure and remade in every call of enclosing
  const { priceAuthority } = makeOnewayPriceAuthorityKit({
    createQuote: roundsManagerKit.contract.makeCreateQuote(),
    notifier: makeNotifierFromSubscriber(answerKit.subscriber),
    quoteIssuer: quoteKit.issuer,
    timer: timerPresence,
    actualBrandIn: brandIn,
    actualBrandOut: brandOut,
  });

  // for each new quote from the priceAuthority, publish it to off-chain storage
  void observeNotifier(
    priceAuthority.makeQuoteNotifier(unitAmountIn, brandOut),
    {
      updateState: quote => {
        trace('new quote', quote);
        void priceKit.recorder.write(priceDescriptionFromQuote(quote));
      },
      fail: reason => {
        throw Error(`priceAuthority observer failed: ${reason}`);
      },
      finish: done => {
        throw Error(`priceAuthority observer died: ${done}`);
      },
    },
  );

  const makeFluxAggregatorKit = prepareExoClassKit(
    baggage,
    'fluxAggregator',
    {
      creator: M.interface('fluxAggregator creatorFacet', {}, { sloppy: true }),
      public: M.interface('fluxAggregator publicFacet', {
        getPriceAuthority: M.call().returns(M.any()),
        getPublicTopics: M.call().returns({
          quotes: M.any(),
          latestRound: M.any(),
        }),
      }),
    },
    () => {
      /** @type {MapStore<string, import('./priceOracleKit.js').OracleKit>} */
      const oracles = makeScalarBigMapStore('oracles', {
        durable: true,
      });
      return { oracles };
    },
    {
      creator: {
        /**
         * An "oracle invitation" is an invitation to be able to submit data to
         * include in the priceAggregator's results.
         *
         * The offer result from this invitation is a OracleAdmin, which can be
         * used directly to manage the price submissions as well as to terminate
         * the relationship.
         *
         * @param {string} oracleId unique per contract instance
         */
        async makeOracleInvitation(oracleId) {
          const { facets } = this;
          trace('makeOracleInvitation', oracleId);
          /**
           * If custom arguments are supplied to the `zoe.offer` call, they can
           * indicate an OraclePriceSubmission notifier and a corresponding
           * `shiftValueOut` that should be adapted as part of the
           * priceAuthority's reported data.
           *
           * @param {ZCFSeat} seat
           */
          const offerHandler = async seat => {
            seat.exit();
            const { oracle } = await facets.creator.initOracle(oracleId);
            const invitationMakers = Far('invitation makers', {
              /** @param {import('./roundsManager.js').PriceRound} result */
              PushPrice(result) {
                return zcf.makeInvitation(
                  /** @param {ZCFSeat} cSeat */
                  async cSeat => {
                    cSeat.exit();
                    await oracle.pushPrice(result);
                  },
                  'PushPrice',
                );
              },
            });

            return harden({
              invitationMakers,
              oracle,
            });
          };

          return zcf.makeInvitation(offerHandler, INVITATION_MAKERS_DESC);
        },
        /** @param {string} oracleId */
        async removeOracle(oracleId) {
          const { oracles } = this.state;
          trace('deleteOracle', oracleId);
          const kit = oracles.get(oracleId);
          kit.admin.disable();
          oracles.delete(oracleId);
        },

        getRoundData: roundIdRaw => {
          return roundsManagerKit.contract.getRoundData(roundIdRaw);
        },

        /** @param {string} oracleId */
        async initOracle(oracleId) {
          const { oracles } = this.state;
          trace('initOracle', oracleId);
          assert.typeof(oracleId, 'string');

          const oracleKit = makeOracleAdminKit(
            harden({
              minSubmissionValue,
              maxSubmissionValue,
              oracleId, // must be unique per vat
              roundPowers: roundsManagerKit.oracle,
              timer: timerPresence,
            }),
          );
          oracles.init(oracleId, oracleKit);

          return oracleKit;
        },

        /**
         * a method to provide all current info oracleStatuses need. Intended
         * only only to be callable by oracleStatuses. Not for use by contracts
         * to read state.
         *
         * @param {string} oracleId
         * @param {bigint} queriedRoundId
         * @returns {Promise<RoundState>}
         */
        async oracleRoundState(oracleId, queriedRoundId) {
          const { oracles } = this.state;
          const blockTimestamp = await E(timerPresence).getCurrentTimestamp();
          const status = await E(oracles.get(oracleId).oracle).getStatus();

          const oracleCount = oracles.getSize();

          const { contract } = roundsManagerKit;
          if (queriedRoundId > 0) {
            const roundStatus = contract.getRoundStatus(queriedRoundId);
            return {
              eligibleForSpecificRound: contract.eligibleForSpecificRound(
                status,
                queriedRoundId,
                blockTimestamp,
              ),
              queriedRoundId,
              latestSubmission: status.latestSubmission,
              startedAt: roundStatus.startedAt,
              roundTimeout: roundStatus.roundTimeout,
              oracleCount,
            };
          } else {
            return {
              ...contract.oracleRoundStateSuggestRound(status, blockTimestamp),
              oracleCount,
            };
          }
        },
      },
      public: {
        getPriceAuthority() {
          return priceAuthority;
        },
        getPublicTopics() {
          return {
            quotes: makeRecorderTopic(
              'Quotes from this price aggregator',
              priceKit,
            ),
            latestRound: makeRecorderTopic(
              'Notification of each round',
              latestRoundKit,
            ),
          };
        },
      },
    },
  );

  return makeFluxAggregatorKit;
};
harden(prepareFluxAggregatorKit);
/** @typedef {ReturnType<Awaited<ReturnType<typeof prepareFluxAggregatorKit>>>} FluxAggregatorKit */
