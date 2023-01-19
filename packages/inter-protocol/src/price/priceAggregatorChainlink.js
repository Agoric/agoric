/** @file
 * Adaptation of Chainlink algorithm to the Agoric platform.
 * Modeled on https://github.com/smartcontractkit/chainlink/blob/master/contracts/src/v0.6/FluxAggregator.sol (version?)
 */
import { AmountMath, AssetKind, makeIssuerKit } from '@agoric/ertp';
import { assertAllDefined } from '@agoric/internal';
import {
  makeNotifierFromSubscriber,
  makeStoredPublishKit,
  makeStoredSubscriber,
  observeNotifier,
  vivifyDurablePublishKit,
} from '@agoric/notifier';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeOnewayPriceAuthorityKit } from '@agoric/zoe/src/contractSupport/index.js';
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { makeOracleAdmin } from './priceOracleAdmin.js';
import { makeRoundsManagerKit } from './roundsManager.js';

export const INVITATION_MAKERS_DESC = 'oracle invitation';

/** @typedef {import('@agoric/vat-data').Baggage} Baggage */

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
 * @property {RelativeTime} restartDelay the number of rounds an Oracle has to wait before they can initiate a round
 * @property {bigint} minSubmissionValue an immutable check for a lower bound of what
 * submission values are accepted from an oracle
 * @property {bigint} maxSubmissionValue an immutable check for an upper bound of what
 * submission values are accepted from an oracle
 * @property {number} timeout the number of seconds after the previous round that
 * allowed to lapse before allowing an oracle to skip an unfinished round
 */

/**
 * PriceAuthority for their median. Unlike the simpler `priceAggregator.js`, this approximates
 * the *Node Operator Aggregation* logic of [Chainlink price
 * feeds](https://blog.chain.link/levels-of-data-aggregation-in-chainlink-price-feeds/).
 *
 * @param {ZCF<ChainlinkConfig & {
 * timer: TimerService,
 * brandIn: Brand<'nat'>,
 * brandOut: Brand<'nat'>,
 * unitAmountIn?: Amount<'nat'>,
 * }>} zcf
 * @param {{
 * marshaller: Marshaller,
 * quoteMint?: ERef<Mint<'set'>>,
 * storageNode: ERef<StorageNode>,
 * }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
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
    timer,

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
    timer,
    unitAmountIn,
  });

  // Get the timer's identity.
  const timerPresence = await timer;

  const quoteMint =
    privateArgs.quoteMint || makeIssuerKit('quote', AssetKind.SET).mint;
  const quoteIssuerRecord = await zcf.saveIssuer(
    E(quoteMint).getIssuer(),
    'Quote',
  );
  const quoteKit = {
    ...quoteIssuerRecord,
    mint: quoteMint,
  };

  const { marshaller, storageNode } = privateArgs;
  assertAllDefined({ marshaller, storageNode });

  const makeAnswerPublishKit = vivifyDurablePublishKit(
    baggage,
    'AnswerPublishKit',
  );

  const makeLatestRoundPublishKit = vivifyDurablePublishKit(
    baggage,
    'LatestRoundPublishKit',
  );

  // For publishing priceAuthority values to off-chain storage
  /** @type {StoredPublishKit<PriceDescription>} */
  const { publisher: pricePublisher, subscriber: quoteSubscriber } =
    makeStoredPublishKit(storageNode, marshaller);

  /** @type {PublishKit<import('./roundsManager.js').LatestRound>} */
  const { publisher: latestRoundPublisher, subscriber: latestRoundSubscriber } =
    makeLatestRoundPublishKit({ valueDurability: 'mandatory' });

  const latestRoundStoredSubscriber = makeStoredSubscriber(
    latestRoundSubscriber,
    E(storageNode).makeChildNode('latestRound'),
    marshaller,
  );

  /** @type {MapStore<string, *>} */
  const oracles = makeScalarBigMapStore('oracles', {
    durable: true,
  });

  // --- [end] Chainlink specific values

  /**
   * This is just a signal that there's a new answer, which is read from `lastValueOutForUnitIn`
   *
   * @type {PublishKit<void>}
   */
  const { publisher: answerPublisher, subscriber: answerSubscriber } =
    makeAnswerPublishKit({ valueDurability: 'mandatory' });

  const roundsManagerKit = makeRoundsManagerKit(
    harden({
      answerPublisher,
      brandIn,
      brandOut,
      latestRoundPublisher,
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
  );

  const { priceAuthority } = makeOnewayPriceAuthorityKit({
    createQuote: roundsManagerKit.contract.makeCreateQuote(),
    notifier: makeNotifierFromSubscriber(answerSubscriber),
    quoteIssuer: quoteKit.issuer,
    timer,
    actualBrandIn: brandIn,
    actualBrandOut: brandOut,
  });

  // for each new quote from the priceAuthority, publish it to off-chain storage
  void observeNotifier(
    priceAuthority.makeQuoteNotifier(unitAmountIn, brandOut),
    {
      updateState: quote =>
        pricePublisher.publish(priceDescriptionFromQuote(quote)),
      fail: reason => {
        throw Error(`priceAuthority observer failed: ${reason}`);
      },
      finish: done => {
        throw Error(`priceAuthority observer died: ${done}`);
      },
    },
  );

  const creatorFacet = Far('PriceAggregatorChainlinkCreatorFacet', {
    /**
     * An "oracle invitation" is an invitation to be able to submit data to
     * include in the priceAggregator's results.
     *
     * The offer result from this invitation is a OracleAdmin, which can be used
     * directly to manage the price submissions as well as to terminate the
     * relationship.
     *
     * @param {string} oracleId unique per contract instance
     */
    makeOracleInvitation: async oracleId => {
      /**
       * If custom arguments are supplied to the `zoe.offer` call, they can
       * indicate an OraclePriceSubmission notifier and a corresponding
       * `shiftValueOut` that should be adapted as part of the priceAuthority's
       * reported data.
       *
       * @param {ZCFSeat} seat
       */
      const offerHandler = async seat => {
        const admin = await creatorFacet.initOracle(oracleId);
        const invitationMakers = Far('invitation makers', {
          /** @param {import('./roundsManager.js').PriceRound} result */
          PushPrice(result) {
            return zcf.makeInvitation(
              /** @param {ZCFSeat} cSeat */
              async cSeat => {
                cSeat.exit();
                await admin.pushPrice(result);
              },
              'PushPrice',
            );
          },
        });
        seat.exit();

        return harden({
          admin,

          invitationMakers,
        });
      };

      return zcf.makeInvitation(offerHandler, INVITATION_MAKERS_DESC);
    },
    /** @param {string} oracleId */
    deleteOracle: async oracleId => {
      // FIXME how to GC and remove its powers?
      oracles.delete(oracleId);
    },

    getRoundData: roundIdRaw => {
      return roundsManagerKit.contract.getRoundData(roundIdRaw);
    },

    /** @param {string} oracleId */
    async initOracle(oracleId) {
      assert.typeof(oracleId, 'string');

      const oracleAdmin = makeOracleAdmin(
        harden({
          minSubmissionValue,
          maxSubmissionValue,
          oracleId, // must be unique per vat
          roundPowers: roundsManagerKit.oracle,
          timer,
        }),
      );
      oracles.init(oracleId, oracleAdmin);

      return oracleAdmin;
    },

    /**
     * a method to provide all current info oracleStatuses need. Intended only
     * only to be callable by oracleStatuses. Not for use by contracts to read state.
     *
     * @param {string} oracleId
     * @param {bigint} queriedRoundId
     * @returns {Promise<RoundState>}
     */
    async oracleRoundState(oracleId, queriedRoundId) {
      const blockTimestamp = await E(timer).getCurrentTimestamp();
      const status = await E(oracles.get(oracleId)).getStatus();

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
  });

  const publicFacet = Far('publicFacet', {
    getPriceAuthority() {
      return priceAuthority;
    },
    getSubscriber: () => quoteSubscriber,
    getRoundStartNotifier() {
      return latestRoundStoredSubscriber;
    },
  });

  return harden({ creatorFacet, publicFacet });
};
harden(start);
