import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeIssuerKit } from '@agoric/ertp';
import { prepareSwingsetVowTools } from '@agoric/vow';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeHeapZone } from '@agoric/zone';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import { E, Far } from '@endo/far';
import type { TestFn } from 'ava';
import { createRequire } from 'node:module';
import { makeZcfTools } from '../../src/utils/zcf-tools.js';

const nodeRequire = createRequire(import.meta.url);
const contractEntry = nodeRequire.resolve('../fixtures/zcfTester.contract.js');

const makeTestContext = async () => {
  let testJig;
  const setJig = jig => (testJig = jig);
  const fakeVatAdmin = makeFakeVatAdmin(setJig);
  const { zoeService: zoe, feeMintAccess } = makeZoeKitForTest(
    fakeVatAdmin.admin,
  );

  const bundleCache = await makeNodeBundleCache(
    'bundles',
    {},
    async s => import(s),
  );
  const contractBundle = await bundleCache.load(contractEntry);

  fakeVatAdmin.vatAdminState.installBundle('b1-contract', contractBundle);
  const installation = await E(zoe).installBundleID('b1-contract');

  const stuff = makeIssuerKit('Stuff');
  await E(zoe).startInstance(installation, { Stuff: stuff.issuer });
  assert(testJig, 'startInstance did not call back to setTestJig');

  const zcf: ZCF = testJig.zcf;

  const zone = makeHeapZone();
  const vt = prepareSwingsetVowTools(zone);
  const zcfTools = makeZcfTools(zcf, vt);
  return { zoe, zcf, zcfTools, vt };
};

type TestContext = Awaited<ReturnType<typeof makeTestContext>>;

const test = anyTest as TestFn<TestContext>;

test.before('set up context', async t => (t.context = await makeTestContext()));

test('unchanged: atomicRearrange(), assertUniqueKeyword()', async t => {
  const { zcfTools } = t.context;

  t.notThrows(() => zcfTools.atomicRearrange([]));

  t.notThrows(() => zcfTools.assertUniqueKeyword('K1'));
  t.throws(() => zcfTools.assertUniqueKeyword('Stuff'));
});

test('changed: makeInvitation: watch promise', async t => {
  const { zoe, zcfTools, vt } = t.context;

  const handler = Far('Trade', { handle: seat => {} });
  const toTradeVow = zcfTools.makeInvitation(handler, 'trade');

  const toTrade = await vt.when(toTradeVow);
  const amt = await E(E(zoe).getInvitationIssuer()).getAmountOf(toTrade);
  t.like(amt, { value: [{ description: 'trade' }] });
});

test('removed: makeInvitation: non-passable handler', async t => {
  const { zcfTools } = t.context;

  const handler = harden(_seat => {});
  t.throws(() => zcfTools.makeInvitation(handler, 'trade'), {
    message: /Remotables must be explicitly declared/,
  });
});
