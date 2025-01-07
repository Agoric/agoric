import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { AmountMath, makeIssuerKit, AssetKind } from '@agoric/ertp';

import { E } from '@endo/eventual-send';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { provideEscrowStorage } from '../../../src/zoeService/escrowStorage.js';
import {
  assertAmountsEqual,
  assertPayoutAmount,
} from '../../zoeTestHelpers.js';

test('provideEscrowStorage', async t => {
  const { createPurse, provideLocalPurse, withdrawPayments, depositPayments } =
    provideEscrowStorage(
      makeScalarBigMapStore('zoe baggage', { durable: true }),
    );

  const stableKit = makeIssuerKit(
    'stable',
    AssetKind.NAT,
    harden({ decimalPlaces: 18 }),
  );

  const ticketKit = makeIssuerKit('tickets', AssetKind.SET);

  await createPurse(stableKit.issuer, stableKit.brand);

  // Normally only used for ZCFMint issuers
  provideLocalPurse(ticketKit.issuer, ticketKit.brand);

  const gameTicketAmount = AmountMath.make(
    ticketKit.brand,
    harden([{ show: 'superbowl' }]),
  );

  const stableAmount = AmountMath.make(stableKit.brand, 5n * 10n ** 18n);

  const wantedConcertTicketAmount = AmountMath.make(
    ticketKit.brand,
    harden([{ show: 'my show' }]),
  );

  const paymentPKeywordRecord = harden({
    GameTicket: E(ticketKit.mint).mintPayment(gameTicketAmount),
    Money: E(stableKit.mint).mintPayment(stableAmount),
  });

  const proposal = harden({
    want: {
      ConcertTicket: wantedConcertTicketAmount,
    },
    give: {
      GameTicket: gameTicketAmount,
      Money: stableAmount,
    },
    exit: {
      onDemand: null,
    },
  });

  const initialAllocation = await depositPayments(
    proposal,
    paymentPKeywordRecord,
  );

  const emptyConcertTicket = AmountMath.makeEmptyFromAmount(
    wantedConcertTicketAmount,
  );

  t.deepEqual(initialAllocation, {
    ConcertTicket: emptyConcertTicket,
    GameTicket: gameTicketAmount,
    Money: stableAmount,
  });

  const payout = withdrawPayments(initialAllocation);

  await assertPayoutAmount(
    t,
    ticketKit.issuer,
    payout.ConcertTicket,
    emptyConcertTicket,
  );

  await assertPayoutAmount(
    t,
    ticketKit.issuer,
    payout.GameTicket,
    gameTicketAmount,
  );

  await assertPayoutAmount(t, stableKit.issuer, payout.Money, stableAmount);

  const initialAllocation2 = await depositPayments(proposal, {
    GameTicket: payout.GameTicket,
    Money: payout.Money,
  });

  await Promise.all(
    Object.entries(initialAllocation).map(async ([keyword, amount]) =>
      assertAmountsEqual(t, amount, initialAllocation2[keyword]),
    ),
  );

  await Promise.all(
    Object.entries(initialAllocation2).map(async ([keyword, amount]) =>
      assertAmountsEqual(t, amount, initialAllocation[keyword]),
    ),
  );
});

const setupPurses = async createPurse => {
  const stableKit = makeIssuerKit(
    'stable',
    AssetKind.NAT,
    harden({ decimalPlaces: 18 }),
  );

  /** @type {IssuerRecord} */
  const stableIssuerRecord = {
    issuer: stableKit.issuer,
    assetKind: AssetKind.NAT,
    brand: stableKit.brand,
  };

  const ticketKit = makeIssuerKit('tickets', AssetKind.SET);

  const ticketIssuerRecord = {
    issuer: ticketKit.issuer,
    assetKind: AssetKind.SET,
    brand: ticketKit.brand,
  };
  await createPurse(stableIssuerRecord.issuer, stableIssuerRecord.brand);
  await createPurse(ticketIssuerRecord.issuer, ticketIssuerRecord.brand);
  return harden({ ticketKit, stableKit });
};

test('payments without matching give keywords', async t => {
  const { createPurse, depositPayments } = provideEscrowStorage(
    makeScalarBigMapStore('zoe baggage', { durable: true }),
  );

  const { ticketKit, stableKit } = await setupPurses(createPurse);

  const gameTicketAmount = AmountMath.make(
    ticketKit.brand,
    harden([{ show: 'superbowl' }]),
  );

  const stableAmount = AmountMath.make(stableKit.brand, 5n * 10n ** 18n);

  const paymentPKeywordRecord = harden({
    GameTicket: E(ticketKit.mint).mintPayment(gameTicketAmount),
    Money: E(stableKit.mint).mintPayment(stableAmount),
    Moola: E(stableKit.mint).mintPayment(stableAmount),
  });

  const proposal = harden({
    want: {},
    give: {
      GameTicket: gameTicketAmount,
      Money: stableAmount,
    },
    exit: {
      onDemand: null,
    },
  });

  await t.throwsAsync(
    async () => depositPayments(proposal, paymentPKeywordRecord),
    {
      message:
        'The "Moola" keyword in the paymentKeywordRecord was not a keyword in proposal.give, which had keywords: ["GameTicket","Money"]',
    },
  );
});

test(`give keywords without matching payments`, async t => {
  const { createPurse, depositPayments } = provideEscrowStorage(
    makeScalarBigMapStore('zoe baggage', { durable: true }),
  );

  const { ticketKit, stableKit } = await setupPurses(createPurse);

  const gameTicketAmount = AmountMath.make(
    ticketKit.brand,
    harden([{ show: 'superbowl' }]),
  );

  const stableAmount = AmountMath.make(stableKit.brand, 5n * 10n ** 18n);

  const paymentPKeywordRecord = harden({
    GameTicket: E(ticketKit.mint).mintPayment(gameTicketAmount),
  });

  const proposal = harden({
    want: {},
    give: {
      GameTicket: gameTicketAmount,
      Money: stableAmount,
    },
    exit: {
      onDemand: null,
    },
  });

  await t.throwsAsync(
    async () => depositPayments(proposal, paymentPKeywordRecord),
    {
      message:
        'The "Money" keyword in proposal.give did not have an associated payment in the paymentKeywordRecord, which had keywords: ["GameTicket"]',
    },
  );
});
