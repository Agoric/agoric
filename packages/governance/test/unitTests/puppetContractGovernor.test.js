import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeNotifierFromAsyncIterable } from '@agoric/notifier';
import { makeZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { buildZoeManualTimer } from '@agoric/zoe/tools/manualTimer.js';
import bundleSource from '@endo/bundle-source';
import { E } from '@endo/eventual-send';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { AssetKind, makeIssuerKit } from '@agoric/ertp';

import { CONTRACT_ELECTORATE, ParamTypes } from '../../src/index.js';
import { setUpGovernedContract } from '../../tools/puppetGovernance.js';
import { MALLEABLE_NUMBER } from '../swingsetTests/contractGovernor/governedContract.js';

/**
 * @import {GovernedPublicFacet, SimpleIssue} from '../../src/types.js';
 */

const makeBundle = async sourceRoot => {
  const url = await importMetaResolve(sourceRoot, import.meta.url);
  const path = new URL(url).pathname;
  const contractBundle = await bundleSource(path);
  return contractBundle;
};
// makeBundle is a slow step, so we do it once for all the tests.
const governedBundleP = await makeBundle(
  '../swingsetTests/contractGovernor/governedContract.js',
);

const governedTerms = {
  governedParams: {
    [MALLEABLE_NUMBER]: {
      type: ParamTypes.NAT,
      value: 602214090000000000000000n,
    },
  },
};

test('multiple params bad change', async t => {
  const zoe = await makeZoeForTest();
  const timer = buildZoeManualTimer(t.log);
  const { governorFacets } = await setUpGovernedContract(
    zoe,
    E(zoe).install(governedBundleP),
    timer,
    governedTerms,
  );

  const paramChangesSpec = harden({
    paramPath: { key: 'governedParams' },
    changes: {
      [CONTRACT_ELECTORATE]: 13n,
      [MALLEABLE_NUMBER]: 42n,
    },
  });

  await t.throwsAsync(
    async () => E(governorFacets.creatorFacet).changeParams(paramChangesSpec),
    {
      message:
        'In "getAmountOf" method of (Zoe Invitation issuer): arg 0: "[13n]" - Must be a remotable Payment, not bigint',
    },
  );
});

test('change a param', async t => {
  const zoe = await makeZoeForTest();
  const timer = buildZoeManualTimer(t.log);
  const { governorFacets, getFakeInvitation } = await setUpGovernedContract(
    zoe,
    E(zoe).install(governedBundleP),
    timer,
    governedTerms,
  );

  /** @type {GovernedPublicFacet<{}>} */
  const publicFacet = await E(governorFacets.creatorFacet).getPublicFacet();
  const notifier = makeNotifierFromAsyncIterable(
    await E(publicFacet).getSubscription(),
  );
  const update1 = await notifier.getUpdateSince();

  // This value isn't available synchronously and we don't have access here to the param manager to await its finish
  // XXX UNTIL https://github.com/Agoric/agoric-sdk/issues/4343
  // t.is(
  //   // @ts-expect-error reaching into unknown values
  //   update1.value.current.Electorate.value.value[0].description,
  //   'getRefund',
  // );
  // t.like(update1, {
  //   value: {
  //     current: {
  //       MalleableNumber: { type: 'nat', value: 602214090000000000000000n },
  //     },
  //   },
  // });

  // This is the wrong kind of invitation, but governance can't tell
  const { fakeInvitationPayment, fakeInvitationAmount } =
    await getFakeInvitation();

  const paramChangesSpec = harden({
    paramPath: { key: 'governedParams' },
    changes: {
      [CONTRACT_ELECTORATE]: fakeInvitationPayment,
      [MALLEABLE_NUMBER]: 42n,
    },
  });

  void E(governorFacets.creatorFacet).changeParams(paramChangesSpec);

  const update2 = await notifier.getUpdateSince(update1.updateCount);
  t.like(update2, {
    value: {
      current: {
        MalleableNumber: { type: 'nat', value: 42n },
      },
    },
  });

  const paramsAfter = await E(publicFacet).getGovernedParams();
  t.deepEqual(paramsAfter.Electorate.value, fakeInvitationAmount);
  t.is(paramsAfter.MalleableNumber.value, 42n);
});

test('set offer Filter directly', async t => {
  const zoe = await makeZoeForTest();
  const timer = buildZoeManualTimer(t.log);
  const { governorFacets } = await setUpGovernedContract(
    zoe,
    E(zoe).install(governedBundleP),
    timer,
    governedTerms,
  );

  await E(governorFacets.creatorFacet).setFilters(['whatever']);
  t.deepEqual(
    await E(zoe).getOfferFilter(governorFacets.creatorFacet.getInstance()),
    ['whatever'],
  );
});

test('call API directly', async t => {
  const zoe = await makeZoeForTest();
  const timer = buildZoeManualTimer(t.log);
  const { governorFacets } = await setUpGovernedContract(
    zoe,
    E(zoe).install(governedBundleP),
    timer,
    governedTerms,
  );

  const result = await E(governorFacets.creatorFacet).invokeAPI(
    'governanceApi',
    [],
  );
  t.deepEqual(result, { apiMethodName: 'governanceApi', methodArgs: [] });
  t.deepEqual(
    // FIXME type the puppet extensions
    // @ts-expect-error xxx governance types https://github.com/Agoric/agoric-sdk/issues/7178
    await E(E(governorFacets.creatorFacet).getPublicFacet()).getApiCalled(),
    1,
  );
});

test('add issuerKeywordRecord', async t => {
  const zoe = await makeZoeForTest();
  const issuerKit = makeIssuerKit('Food', AssetKind.COPY_BAG);
  const timer = buildZoeManualTimer(t.log);
  const { governorFacets } = await setUpGovernedContract(
    zoe,
    E(zoe).install(governedBundleP),
    timer,
    governedTerms,
    {},
    { Food: issuerKit.issuer },
  );

  const instance = await E(governorFacets.creatorFacet).getInstance();
  t.deepEqual(await E(zoe).getIssuers(instance), { Food: issuerKit.issuer });
});
