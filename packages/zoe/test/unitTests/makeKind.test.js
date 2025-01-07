import {
  test,
  VatData,
} from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import bundleSource from '@endo/bundle-source';

import { E } from '@endo/eventual-send';
import { makeZoeForTest } from '../../tools/setup-zoe.js';
import { makeFakeVatAdmin } from '../../tools/fakeVatAdmin.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const root = `${dirname}/../minimalMakeKindContract.js`;

test('defineKind non-swingset', async t => {
  const bundle = await bundleSource(root);
  const { admin: fakeVatAdmin, vatAdminState } = makeFakeVatAdmin();
  const zoe = makeZoeForTest(fakeVatAdmin);
  vatAdminState.installBundle('b1-minimal', bundle);
  const installation = await E(zoe).installBundleID('b1-minimal');
  t.notThrows(() => VatData.defineKind('x', () => {}, {}));
  t.notThrows(() => VatData.defineKindMulti('x', () => {}, { x: {}, y: {} }));
  t.notThrows(() => VatData.makeKindHandle('tag'));
  const kh = VatData.makeKindHandle('tag');
  t.notThrows(() => VatData.defineDurableKind(kh, () => {}, {}));
  const kh2 = VatData.makeKindHandle('tag');
  t.notThrows(() =>
    VatData.defineDurableKindMulti(kh2, () => {}, { x: {}, y: {} }),
  );
  t.notThrows(() => VatData.makeScalarBigMapStore());
  t.notThrows(() => VatData.makeScalarBigWeakMapStore());
  t.notThrows(() => VatData.makeScalarBigSetStore());
  t.notThrows(() => VatData.makeScalarBigWeakSetStore());
  await t.notThrowsAsync(async () => E(zoe).startInstance(installation));
});
