import { test as anyTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { heapVowTools } from '@agoric/vow/vat.js';

import { inspectMapStore } from '@agoric/internal/src/testing-utils.js';
import { E } from '@endo/eventual-send';
import { setUpZoeForTest } from '../../../tools/setup-zoe.js';

/**
 * @import {start as startValueVow} from '../../../src/contracts/valueVow.contract.js';
 * @import {Installation} from '../../../src/zoeService/utils.js';
 */

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractFile = `${dirname}/../../../src/contracts/valueVow.contract.js`;

/** @type {import('ava').TestFn<{ installation: Installation<typeof startValueVow>, zoe: ZoeService }>} */
const test = anyTest;

test.before(async t => {
  const { bundleAndInstall, zoe } = await setUpZoeForTest();
  const installation = await bundleAndInstall(contractFile);

  t.context = {
    installation,
    zoe,
  };
});

test('resolves', async t => {
  const { installation, zoe } = t.context;
  const { publicFacet } = await E(zoe).startInstance(installation);

  const vow = E(publicFacet).getValue();
  await E(publicFacet).setValue('some value');
  t.is(await heapVowTools.asPromise(vow), 'some value');
});

test('invitations', async t => {
  const { installation, zoe } = t.context;
  const { publicFacet } = await E(zoe).startInstance(installation);
  const vow = await E(
    E(zoe).offer(E(publicFacet).makeGetterInvitation()),
  ).getOfferResult();

  await E(zoe).offer(
    E(publicFacet).makeSetterInvitation(),
    {},
    {},
    { value: 'hello' },
  );

  t.is(await heapVowTools.asPromise(vow), 'hello');
});

test('baggage', async t => {
  /** @type {import('@agoric/swingset-liveslots').Baggage} */
  let contractBaggage;
  const setJig = ({ baggage }) => {
    contractBaggage = baggage;
  };
  const { bundleAndInstall, zoe } = await setUpZoeForTest({
    setJig,
  });

  await E(zoe).startInstance(
    /** @type {Installation<startValueVow>} */
    (await bundleAndInstall(contractFile)),
  );

  // @ts-expect-error setJig may not have been called
  const tree = inspectMapStore(contractBaggage);
  t.snapshot(tree, 'contract baggage after start');
});
