import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeDurableZone } from '@agoric/zone/durable.js';
import {
  prepareMockOrchestratorKit,
  ZERO_ADDR,
} from '../../../src/mock-orch-ertp/mock-orch/mock-orch.js';

test('mock orch chain', async t => {
  const baggage = makeScalarBigMapStore('test-baggage', { durable: true });
  const zone = makeDurableZone(baggage);
  const mockOrchestratorKit = prepareMockOrchestratorKit(zone);
  const { orchestrator, admin: orchAdmin } = mockOrchestratorKit();

  const aChain = await orchestrator.getChain('a');
  const { chainId: aChainId } = await aChain.getChainInfo();
  t.is(aChainId, 'a');
  const aliceAcct = await aChain.makeAccount();
  const { chainId: aliceChainId, value: aliceAcctAddrValue } =
    aliceAcct.getAddress();
  t.is(aliceChainId, 'a');
  t.is(aliceAcctAddrValue, '1');
  const aliceBalances = await aliceAcct.getBalances();
  t.is(aliceBalances.length, 0);

  const bChain = await orchestrator.getChain('b');
  const { chainId: bChainId } = await bChain.getChainInfo();
  t.is(bChainId, 'b');
  const bobAcct = await bChain.makeAccount();
  const { chainId: bobChainId, value: bobAcctAddrValue } = bobAcct.getAddress();
  t.is(bobChainId, 'b');
  t.is(bobAcctAddrValue, '1');
  const bobBalances = await bobAcct.getBalances();
  t.is(bobBalances.length, 0);

  const bucksDenomMint = await orchAdmin.makeDenom('bucks', aChain);
  await bucksDenomMint.mintTo(aliceAcct.getAddress(), {
    denom: 'bucks',
    value: 300n,
  });
  t.deepEqual(await aliceAcct.getBalances(), [{ denom: 'bucks', value: 300n }]);

  await aliceAcct.transfer(bobAcct.getAddress(), {
    denom: 'bucks',
    value: 100n,
  });
  t.deepEqual(await aliceAcct.getBalances(), [{ denom: 'bucks', value: 200n }]);
  t.deepEqual(await bobAcct.getBalances(), [{ denom: 'bucks', value: 100n }]);

  await aliceAcct.transfer(ZERO_ADDR, {
    denom: 'bucks',
    value: 2n,
  });
  t.deepEqual(await aliceAcct.getBalances(), [{ denom: 'bucks', value: 198n }]);
  t.deepEqual(await bobAcct.getBalances(), [{ denom: 'bucks', value: 100n }]);
});
