import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { AssetKind } from '@agoric/ertp';
import { getStringMethodNames } from '@agoric/internal';
import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { Far, passStyleOf } from '@endo/marshal';
import path from 'path';
import { setup } from './setupBasicMints.js';
import { setupZCFTest } from './zcf/setupZcfTest.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

test('bad installation', async t => {
  const { zoe } = setup();
  // @ts-expect-error deliberate invalid arguments for testing
  await t.throwsAsync(async () => E(zoe).startInstance(), {
    message:
      'In "startInstance" method of (ZoeService): Expected at least 1 arguments: []',
  });
});

function isEmptyFacet(t, facet) {
  t.is(passStyleOf(facet), 'remotable');
  t.deepEqual(
    Object.keys(facet).filter(name => !name.startsWith('__')),
    [],
  );
}

function facetHasMethods(t, facet, names) {
  t.is(passStyleOf(facet), 'remotable');
  t.deepEqual(
    Object.keys(facet).filter(name => !name.startsWith('__')),
    names,
  );
}

test('no issuerKeywordRecord, no terms', async t => {
  const result = await setupZCFTest();
  // Note that deepEqual treats all empty objects (handles) as interchangeable.
  t.deepEqual(
    Object.keys(result.startInstanceResult)
      .filter(name => !name.startsWith('__'))
      .sort(),
    [
      'adminFacet',
      'creatorFacet',
      'creatorInvitation',
      'instance',
      'publicFacet',
    ],
  );
  isEmptyFacet(t, result.creatorFacet);
  t.deepEqual(result.creatorInvitation, undefined);
  facetHasMethods(t, result.startInstanceResult.publicFacet, [
    'makeInvitation',
  ]);
  isEmptyFacet(t, result.startInstanceResult.adminFacet);
});

test('promise for installation', async t => {
  const { startInstanceResult } = await setupZCFTest();

  const result = await startInstanceResult;
  // Note that deepEqual treats all empty objects (handles) as interchangeable.
  t.deepEqual(
    Object.keys(result)
      .filter(name => !name.startsWith('__'))
      .sort(),
    [
      'adminFacet',
      'creatorFacet',
      'creatorInvitation',
      'instance',
      'publicFacet',
    ],
  );
  isEmptyFacet(t, result.creatorFacet);
  t.deepEqual(result.creatorInvitation, undefined);
  facetHasMethods(t, result.publicFacet, ['makeInvitation']);
  t.deepEqual(
    getStringMethodNames(result.adminFacet).filter(
      name => !name.startsWith('__'),
    ),
    [
      'getVatShutdownPromise',
      'restartContract',
      'terminateContract',
      'upgradeContract',
    ],
  );
});

test('terms, issuerKeywordRecord switched', async t => {
  const { zoe } = setup();
  const installation = await E(zoe).installBundleID('b1-contract');
  const { moolaKit } = setup();
  await t.throwsAsync(
    async () =>
      E(zoe).startInstance(
        installation,
        // @ts-expect-error intentional error
        { something: 2 },
        { Moola: moolaKit.issuer },
      ),
    {
      message:
        'In "startInstance" method of (ZoeService): arg 1?: something: [1]: 2 - Must match one of ["[match:remotable]","[match:kind]"]',
    },
  );
});

test('bad issuer, makeEmptyPurse throws', async t => {
  const { zoe } = setup();
  const installation = await E(zoe).installBundleID('b1-contract');
  const brand = Far('brand', {
    isMyIssuer: i => i === badIssuer,
    getDisplayInfo: () => ({ decimalPlaces: 6, assetKind: AssetKind.NAT }),
  });
  const badIssuer = Far('issuer', {
    makeEmptyPurse: async () => {
      throw Error('bad issuer');
    },
    getBrand: () => brand,
  });
  await t.throwsAsync(
    // @ts-expect-error intentional error
    async () => E(zoe).startInstance(installation, { Money: badIssuer }),
    {
      message:
        'A purse could not be created for brand "[Alleged: brand]" because: "[Error: bad issuer]"',
    },
  );
});

test('unexpected properties', async t => {
  const { zoe } = setup();

  const contractPath = `${dirname}/unexpectedPropertiesContract.js`;
  const bundle = await bundleSource(contractPath);
  const installation = await E(zoe).install(bundle);

  await t.throwsAsync(async () => E(zoe).startInstance(installation), {
    message:
      'contract "start" returned unrecognized properties ["unexpectedProperty"]',
  });
});

test('prepare and start', async t => {
  const { zoe } = setup();

  const contractPath = `${dirname}/redundantPrepareContract.js`;
  const bundle = await bundleSource(contractPath);
  const installation = await E(zoe).install(bundle);

  await t.throwsAsync(async () => E(zoe).startInstance(installation), {
    message: 'contract must provide exactly one of "start" and "prepare"',
  });
});

test('before meta', async t => {
  const { zoe } = setup();

  const contractPath = `${dirname}/beforeMetaContract.js`;
  const bundle = await bundleSource(contractPath);
  const installation = await E(zoe).install(bundle);

  await t.throwsAsync(async () => E(zoe).startInstance(installation), {
    message: 'privateArgs: "[undefined]" - Must be: {"greeting":"hello"}',
  });

  const kit = await E(zoe).startInstance(
    installation,
    {},
    {},
    { greeting: 'hello' },
  );
  t.true('creatorFacet' in kit);
});
