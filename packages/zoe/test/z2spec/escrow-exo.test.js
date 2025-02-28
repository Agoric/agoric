// @ts-check
import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { makeHeapZone } from '@agoric/zone';
import { AmountMath, makeDurableIssuerKit } from '@agoric/ertp';
import { objectMap } from '@endo/patterns';
import { E } from '@endo/far';
import { prepareEscrowExchange } from '../../src/z2spec/escrow-exo.js';
import { makeHandle } from '../../src/makeHandle.js';

const { keys } = Object;

/**
 * @import {EscrowSeatKit} from '../../src/z2spec/escrow-exo.js'
 */

/** @param {EscrowSeatKit['resolver']} resolver  */
const simpleExchange = async resolver => {
  const { give, want } = resolver.readOnly().getProposal();
  resolver.updateAllocation(want, give);
  await resolver.exit('fun!');
};

test('escrowExchange: Alice and Bob do simpleExchange ', async t => {
  const z1 = makeHeapZone();
  /** @type {ZCF['makeInvitation']} */
  const makeInvitation = async (_h, description, customDetails, _p) => {
    t.log('makeInvitation', { description, customDetails });
    // @ts-expect-error mock
    return makeHandle('InvitationMock');
  };
  const { makeEscrowExchange } = prepareEscrowExchange(z1, makeInvitation);
  const kit = {
    Money: makeDurableIssuerKit(z1.mapStore('MB'), 'Money'),
    Stock: makeDurableIssuerKit(z1.mapStore('SB'), 'Stock'),
  };
  const { make } = AmountMath;
  const { brand: Money } = kit.Money;
  const { brand: Stock } = kit.Stock;
  const issuers = harden({ Money: kit.Money.issuer, Stock: kit.Stock.issuer });

  const ex1 = makeEscrowExchange();

  /**
   * @param {string} name
   * @param {ProposalRecord} proposal
   * @param {Payment} payment
   */
  const makeParty = (name, proposal, payment) => {
    const purses = {
      Money: issuers.Money.makeEmptyPurse(),
      Stock: issuers.Stock.makeEmptyPurse(),
    };
    const { give } = proposal;
    t.log(name, 'to give', { ...give, payment });

    const go = async () => {
      const pmts = { [keys(give)[0]]: payment };
      const { seat, resolver } = await ex1.makeEscrowSeatKit(proposal, pmts);
      t.log(name, 'got seat, resolver', seat);

      const participate = simpleExchange(resolver);

      const deposit = E.when(seat.getPayouts(), payouts =>
        objectMap(payouts, (pmtP, k) =>
          E.when(pmtP, pmt => {
            t.log(name, 'depositing', k);
            return purses[k].deposit(pmt);
          }),
        ),
      );

      return Promise.all([participate, deposit]);
    };

    const getBalances = () => objectMap(purses, p => p.getCurrentAmount());
    return { go, getBalances };
  };

  await Promise.all([
    ex1.addIssuer('Money', issuers.Money),
    ex1.addIssuer('Stock', issuers.Stock),
  ]);
  t.log('added issuers', ...keys(ex1.getIssuers()));

  const exit = { onDemand: null };
  const { a, b } = {
    a: makeParty(
      'Alice',
      {
        give: { Money: make(Money, 100n) },
        want: { Stock: make(Stock, 10n) },
        exit,
      },
      kit.Money.mint.mintPayment(make(Money, 100n)),
    ),
    b: makeParty(
      'Bob',
      {
        give: { Stock: make(Stock, 10n) },
        want: { Money: make(Money, 100n) },
        exit,
      },
      kit.Stock.mint.mintPayment(make(Stock, 10n)),
    ),
  };

  await Promise.all([a.go(), b.go()]);

  {
    const actual = { a: a.getBalances(), b: b.getBalances() };
    t.log('resulting balances', actual);
    t.deepEqual(actual, {
      a: { Money: make(Money, 0n), Stock: make(Stock, 10n) },
      b: { Money: make(Money, 100n), Stock: make(Stock, 0n) },
    });
  }
});

test.todo('test in durable zone');

test.todo('test makeTransferInvitation');
