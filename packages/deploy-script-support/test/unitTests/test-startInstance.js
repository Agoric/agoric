// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeIssuerKit } from '@agoric/ertp';
import { makeZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import bundleSource from '@endo/bundle-source';
import { E } from '@endo/far';

import { resolvePathname } from '@agoric/swingset-vat/tools/paths.js';
import { makeStartInstance } from '../../src/startInstance.js';

/** @typedef {import('@agoric/deploy-script-support/src/externalTypes').Petname} Petname */

test('startInstance', async t => {
  const MOOLA_BRAND_PETNAME = 'moola';
  const USD_BRAND_PETNAME = 'usd';

  const moolaKit = makeIssuerKit('moola');
  const usdKit = makeIssuerKit('usd');

  const zoe = makeZoeForTest();

  const bundlePath = resolvePathname(
    '@agoric/zoe/src/contracts/automaticRefund.js',
    import.meta.url,
  );
  const bundle = await bundleSource(bundlePath);
  const installation = E(zoe).install(bundle);

  const zoeInvitationIssuer = E(zoe).getInvitationIssuer();
  const zoeInvitationPurse = E(zoeInvitationIssuer).makeEmptyPurse();

  /** @type {import('../../src/startInstance.js').IssuerManager} */
  // @ts-expect-error cast mock
  const issuerManager = {
    get: petname => {
      if (petname === MOOLA_BRAND_PETNAME) {
        return moolaKit.issuer;
      }
      if (petname === USD_BRAND_PETNAME) {
        return usdKit.issuer;
      }
      throw Error('not found');
    },
  };

  /** @type {Petname | undefined} */
  let addedPetname;

  /** @type {import('../../src/startInstance.js').InstanceManager} */
  // @ts-expect-error cast mock
  const instanceManager = {
    add: async (petname, _instance) => {
      addedPetname = petname;
    },
  };

  const startInstance = makeStartInstance(
    issuerManager,
    instanceManager,
    zoe,
    zoeInvitationPurse,
  );

  const startInstanceConfig = {
    instancePetname: 'automaticRefund',
    installation,
    issuerPetnameKeywordRecord: {
      Collateral: MOOLA_BRAND_PETNAME,
      Loan: USD_BRAND_PETNAME,
    },
  };

  const { creatorFacet, publicFacet, instance, creatorInvitationDetails } =
    await startInstance(startInstanceConfig);

  t.is(addedPetname, 'automaticRefund');
  t.truthy(creatorFacet);
  t.is(await E(zoe).getPublicFacet(instance), publicFacet);
  t.is(creatorInvitationDetails.description, 'getRefund');
});
