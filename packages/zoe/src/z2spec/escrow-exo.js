/**
 * @file escrow exchange using ownable seat, resolver
 */
// @ts-check

import { AmountMath } from '@agoric/ertp';
import { deeplyFulfilledObject } from '@agoric/internal';
import { prepareDurablePublishKit } from '@agoric/notifier';
import { assert, bare, Fail, q } from '@endo/errors';
import { E } from '@endo/far';
import { M, objectMap } from '@endo/patterns';
import {
  addToAllocation,
  subtractFromAllocation,
} from '../contractFacet/allocationMath.js';
import { isOfferSafe } from '../contractFacet/offerSafety.js';
import { prepareOwnable } from '../contractSupport/prepare-ownable.js';

/**
 * @import {Zone} from '@agoric/base-zone'
 */

const { keys, entries, fromEntries } = Object;
const { isEmpty } = AmountMath;

const objectFilter = (obj, pred) =>
  fromEntries(entries(obj).filter(([k, v]) => pred(v, k)));

/**
 * @param {Zone} zone
 * @param {<T>() => PublishKit<T>} makeDurablePublishKit
 */
export const prepareSeatKit = (zone, makeDurablePublishKit) =>
  zone.exoClassKit(
    'Seat Kit',
    undefined,
    proposal => {
      /** @type {PublishKit<unknown>} */
      const exitKit = makeDurablePublishKit();
      /** @type {PublishKit<PaymentPKeywordRecord>} */
      const payoutsKit = makeDurablePublishKit();
      return {
        proposal,
        exitKit,
        payoutsKit,
        exiting: false,
        /** @type {Allocation} */
        currentAllocation: proposal.give,
      };
    },
    {
      readOnly: {
        hasExited() {
          return this.state.exiting;
        },
        getProposal() {
          return this.state.proposal;
        },
        getCurrentAllocation() {
          return this.state.currentAllocation;
        },
        getExitSubscriber() {
          return this.state.exitKit.subscriber;
        },
      },

      /** The right to collect payouts */
      seat: {
        /** @param {Keyword} kw */
        async getPayout(kw) {
          const { payoutsKit } = this.state;
          const paid = await payoutsKit.subscriber.getUpdateSince();
          return paid.value[kw];
        },
        async getPayouts() {
          const { payoutsKit } = this.state;
          const paid = await payoutsKit.subscriber.getUpdateSince();
          return paid.value;
        },

        /** @param {unknown} completion */
        async exit(completion) {
          assert.fail('TODO');
        },
        fail(reason) {
          assert.fail('TODO');
        },

        readOnly() {
          const { readOnly } = this.facets;
          return readOnly;
        },

        getInvitationCustomDetails() {
          const { exiting, proposal, currentAllocation } = this.state;
          !exiting || Fail`already exited`;

          return harden({
            proposal,
            currentAllocation,
          });
        },

        // repeat accessors for compat
        hasExited() {
          return this.state.exiting;
        },
        getProposal() {
          return this.state.proposal;
        },
        getCurrentAllocation() {
          return this.state.currentAllocation;
        },
        getExitSubscriber() {
          return this.state.exitKit.subscriber;
        },
      },
      /** The right to allocate payouts (subject to offer safety) */
      resolver: {
        readOnly() {
          const { readOnly } = this.facets;
          return readOnly;
        },
        /**
         * @param {AmountKeywordRecord} more
         * @param {AmountKeywordRecord} less
         * @throws if proposal is violated
         */
        updateAllocation(more, less) {
          const { proposal, currentAllocation, exiting } = this.state;
          !exiting || Fail`already exited`;
          const candidate = subtractFromAllocation(
            addToAllocation(currentAllocation, more),
            less,
          );
          isOfferSafe(proposal, candidate) ||
            Fail`Offer safety was violated by the proposed allocation: ${candidate}. Proposal was ${proposal}`;
          this.state.currentAllocation = candidate;
        },
        /** @param {unknown} completion */
        async exit(completion) {
          if (this.state.exiting) {
            return;
          }
          const { exitKit, payoutsKit } = this.state;

          this.state.exiting = true;
          exitKit.publisher.finish(completion);
          await deeplyFulfilledObject(payoutsKit.subscriber.getUpdateSince());
        },
        fail(reason) {
          assert.fail('TODO');
        },

        getInvitationCustomDetails() {
          const { exiting, proposal, currentAllocation } = this.state;
          !exiting || Fail`already exited`;

          return harden({
            proposal,
            currentAllocation,
          });
        },
      },
      /**
       * Caller must escrow proposal.give worth of funds;
       * then use getExitSubscriber(); on update, provide payments.
       */
      payee: {
        /** @param {PaymentPKeywordRecord} payments */
        async receive(payments) {
          const { payoutsKit } = this.state;
          payoutsKit.publisher.finish(payments);

          await payoutsKit.subscriber.getUpdateSince();
        },
      },
    },
  );

const assertKeywordSubset = (partLabel, part, whole) => {
  const wholeKeys = keys(whole);
  const extraKeys = keys(part).filter(k => !wholeKeys.includes(k));
  extraKeys.length === 0 ||
    Fail`unexpected ${bare(partLabel)} keywords: ${q(extraKeys)} not in ${q(wholeKeys)}`;
};

/**
 *  @param {Zone} zone
 * @param {ZCF['makeInvitation']} makeInvitation
 */
export const prepareEscrowExchange = (zone, makeInvitation) => {
  const makeDurablePublishKit = prepareDurablePublishKit(
    zone.mapStore('publish baggage'),
    'escrow publisher',
  );
  const makeSeatKit = prepareSeatKit(zone, makeDurablePublishKit);

  const makeOwnableSeat = prepareOwnable(
    zone.subZone('ownableSeat'),
    makeInvitation,
    'OwnableSeat',
    /* XXX @type {(keyof EscrowSeat)[]} */
    /** @type {const} */ ([
      'readOnly',
      'hasExited',
      'getProposal',
      'getCurrentAllocation',
      'getExitSubscriber',
      'getPayout',
      'getPayouts',
      'exit',
      'fail',
    ]),
  );

  const makeOwnableSeatResolver = prepareOwnable(
    zone.subZone('ownableSeatResolver'),
    makeInvitation,
    'OwnableSeatResolver',
    /* XXX @type {(keyof EscrowSeatResolver)[]} */
    /** @type {const} */ (['readOnly', 'exit', 'fail', 'updateAllocation']),
  );

  const makeEscrowExchange = zone.exoClass(
    'EscrowExchange',
    M.interface('EscrowExchangeI', {}, { defaultGuards: 'passable' }),
    () => ({
      /** @type {IssuerKeywordRecord} */
      issuers: {},
      /** @type {Record<Keyword, Purse>} */
      escrowPurses: {},
    }),
    {
      /**
       * TODO: use brands instead of keywords?
       *
       * @param {Keyword} keyword
       * @param {Issuer} issuer
       */
      async addIssuer(keyword, issuer) {
        !(keyword in this.state.issuers) ||
          Fail`keyword alread used: ${keyword}`;
        const purse = await E(issuer).makeEmptyPurse();
        const { issuers, escrowPurses } = this.state;
        !(keyword in issuers) || Fail`keyword alread used: ${keyword}`;
        this.state.issuers = harden({ ...issuers, [keyword]: issuer });
        this.state.escrowPurses = harden({ ...escrowPurses, [keyword]: purse });
      },
      getIssuers() {
        return this.state.issuers;
      },
      /**
       * TODO: with the escrow service separate from the contract host,
       * is the exit rule relevant to the escrow service?
       *
       * @param {ProposalRecord} proposal
       * @param {PaymentKeywordRecord} payments
       */
      async makeEscrowSeatKit(proposal, payments) {
        const { escrowPurses } = this.state;

        assertKeywordSubset('give', proposal.give, escrowPurses);
        assertKeywordSubset('want', proposal.want, escrowPurses);
        assertKeywordSubset('payment', payments, escrowPurses);
        const giveKeys = keys(proposal.give);

        // TODO: partial failure
        await Promise.all(
          giveKeys.map(kw => {
            return E(escrowPurses[kw])
              .deposit(payments[kw])
              .then(() => {});
          }),
        );

        const seatKit = makeSeatKit(proposal);

        const { payee, readOnly } = seatKit;
        const exitSubscriber = readOnly.getExitSubscriber();
        // TODO: not prompt! save state for resume after upgrade
        void E.when(exitSubscriber.subscribeAfter(), async () => {
          const allocation = readOnly.getCurrentAllocation();
          const nonEmpty = objectFilter(allocation, a => !isEmpty(a));
          const payouts = await deeplyFulfilledObject(
            objectMap(nonEmpty, (amt, kw) => E(escrowPurses[kw]).withdraw(amt)),
          );
          // TODO: failure?
          // TODO: expose payments publisher?
          return E.when(payee.receive(payouts), () => {});
        });

        const { seat, resolver } = seatKit;

        const ownableSeat = makeOwnableSeat(seat);
        const ownableResolver = makeOwnableSeatResolver(resolver);

        return harden({
          seat: ownableSeat,
          resolver: ownableResolver,
          readOnly,
        });
      },
    },
  );
  return { makeEscrowExchange, makeSeatKit };
};
/** @typedef {ReturnType<ReturnType<typeof prepareEscrowExchange>['makeEscrowExchange']>} EscrowExchange */
/** @typedef {Awaited<ReturnType<EscrowExchange['makeEscrowSeatKit']>>} EscrowSeatKit */
/** @typedef {EscrowSeatKit['seat']} EscrowSeat */
/** @typedef {EscrowSeatKit['resolver']} EscrowSeatResolver */
