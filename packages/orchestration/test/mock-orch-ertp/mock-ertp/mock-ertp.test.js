import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { prepareMockOrchestratorKit } from '../../../src/mock-orch-ertp/mock-orch/mock-orch.js';
import { prepareERTPOrchestrator } from '../../../src/mock-orch-ertp/mock-ertp/mock-ertp.js';

/**
 * @import {ERef} from '@endo/eventual-send'
 * @import {Amount} from '@agoric/ertp'
 */

test('mock ertp fresh', async t => {
  const baggage = makeScalarBigMapStore('test-baggage', { durable: true });
  const zone = makeDurableZone(baggage);
  const mockOrchestratorKit = prepareMockOrchestratorKit(zone);
  const { orchestrator, admin: orchAdmin } = mockOrchestratorKit();

  const mockERTPOrchestrator = prepareERTPOrchestrator(zone);
  const ertpOrch = mockERTPOrchestrator(orchestrator, orchAdmin);

  const aChain = await orchestrator.getChain('a');
  t.truthy(aChain);
  const {
    brand: bucksBrand,
    issuer: bucksIssuer,
    admin: _bucksAdmin,
    mint: bucksMint,
  } = await ertpOrch.provideIssuerKitForDenom('bucks', 'a');

  const bucks = value => ({
    brand: bucksBrand,
    value,
  });

  const aliceBucksPurse = await bucksIssuer.makeEmptyPurse();
  const bobBucksPurse = await bucksIssuer.makeEmptyPurse();

  const initBucksPayment = await bucksMint.mintPayment(bucks(300n));

  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(0n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(0n));
  t.deepEqual(await bucksIssuer.getAmountOf(initBucksPayment), bucks(300n));

  t.deepEqual(await aliceBucksPurse.deposit(initBucksPayment), bucks(300n));
  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(300n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(0n));
  t.false(await bucksIssuer.isLive(initBucksPayment));

  const alicePaysBob = await aliceBucksPurse.withdraw(bucks(100n));
  t.deepEqual(await bucksIssuer.getAmountOf(alicePaysBob), bucks(100n));

  t.deepEqual(await bobBucksPurse.deposit(alicePaysBob), bucks(100n));
  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(200n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(100n));
  t.false(await bucksIssuer.isLive(alicePaysBob));

  const aliceFirewood = await aliceBucksPurse.withdraw(bucks(2n));
  t.deepEqual(await bucksIssuer.burn(aliceFirewood), bucks(2n));

  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(198n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(100n));
  t.false(await bucksIssuer.isLive(aliceFirewood));
});

test('mock ertp window', async t => {
  const baggage = makeScalarBigMapStore('test-baggage', { durable: true });
  const zone = makeDurableZone(baggage);
  const mockOrchestratorKit = prepareMockOrchestratorKit(zone);
  const { orchestrator, admin: orchAdmin } = mockOrchestratorKit();

  const aChain = await orchestrator.getChain('a');
  const aliceAcct = await aChain.makeAccount();
  const bChain = await orchestrator.getChain('b');
  const bobAcct = await bChain.makeAccount();

  const bucksDenomMint = await orchAdmin.makeDenom('bucks', aChain);

  await bucksDenomMint.mintTo(aliceAcct.getAddress(), {
    denom: 'bucks',
    value: 300n,
  });

  const mockERTPOrchestrator = prepareERTPOrchestrator(zone);
  const ertpOrch = mockERTPOrchestrator(orchestrator);

  const {
    brand: bucksBrand,
    issuer: bucksIssuer,
    admin: bucksAdmin,
    mint: optERTPBucksMint,
  } = await ertpOrch.provideIssuerKitForDenom('bucks', 'a');

  t.is(optERTPBucksMint, undefined);

  const bucks = value => ({
    brand: bucksBrand,
    value,
  });

  const aliceBucksPurse = await bucksAdmin.makePurse(aliceAcct);
  const bobBucksPurse = await bucksAdmin.makePurse(bobAcct);

  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(300n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(0n));

  const alicePaysBob = await aliceBucksPurse.withdraw(bucks(100n));
  t.deepEqual(await bucksIssuer.getAmountOf(alicePaysBob), bucks(100n));

  t.deepEqual(await bobBucksPurse.deposit(alicePaysBob), bucks(100n));
  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(200n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(100n));
  t.false(await bucksIssuer.isLive(alicePaysBob));

  const aliceFirewood = await aliceBucksPurse.withdraw(bucks(2n));
  t.deepEqual(await bucksIssuer.burn(aliceFirewood), bucks(2n));

  t.deepEqual(await aliceBucksPurse.getCurrentAmount(), bucks(198n));
  t.deepEqual(await bobBucksPurse.getCurrentAmount(), bucks(100n));
  t.false(await bucksIssuer.isLive(aliceFirewood));

  await t.throwsAsync(
    () => ertpOrch.provideIssuerKitForDenom('quatloos', 'a'),
    {
      message: 'Cannot mint without orchestrator admin facet',
    },
  );
});
