import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { Far } from '@endo/marshal';
import { makeScalarBigMapStore } from '@agoric/vat-data';

import { makeInstanceAdminStorage } from '../../../src/zoeService/instanceAdminStorage.js';
import { setup } from '../setupBasicMints.js';

test('makeInstanceAdminStorage', async t => {
  const ias = makeInstanceAdminStorage(
    makeScalarBigMapStore('zoe baggage', { durable: true }),
  );

  const { moolaKit } = setup();
  const mockInstallation1 = Far('mockInstallation', {});
  const mockInstance1 = Far('mockInstance', {});
  const mockBrandRecord = harden({ M: moolaKit.brand });
  const mockIssuerRecord = harden({ M: moolaKit.issuer });
  const mockTerms = harden({ something: 'anything' });
  const mockFacet = harden(
    Far('mock', {
      identity: a => a,
    }),
  );
  const mockInstanceAdmin = Far('mockInstanceAdmin', {
    getInstallation: () => mockInstallation1,
    getBrands: () => mockBrandRecord,
    getPublicFacet: () => mockFacet,
    getIssuers: () => mockIssuerRecord,
    getTerms: () => mockTerms,
    getOfferFilter: () => ['filter'],
  });

  void ias.updater.initInstanceAdmin(mockInstance1, mockInstanceAdmin);
  t.is(await ias.accessor.getInstallation(mockInstance1), mockInstallation1);
  t.is(await ias.accessor.getBrands(mockInstance1), mockBrandRecord);
  t.is(await ias.accessor.getPublicFacet(mockInstance1), mockFacet);
  t.is(await ias.accessor.getIssuers(mockInstance1), mockIssuerRecord);
  t.is(await ias.accessor.getTerms(mockInstance1), mockTerms);
});

test('add another instance admin for same instance', async t => {
  const ias = makeInstanceAdminStorage(
    makeScalarBigMapStore('zoe baggage', { durable: true }),
  );

  const mockInstallation1 = Far('mockInstallation', {});
  const mockInstance1 = Far('mockInstance', {});
  const mockInstanceAdmin1 = Far('mockInstanceAdmin', {
    getInstallation: () => mockInstallation1,
    getBrands: () => 'brands',
    getPublicFacet: () => 'publicFacet',
    getIssuers: () => 'issuers',
    getTerms: () => 'terms',
    getOfferFilter: () => 'filter',
  });

  void ias.updater.initInstanceAdmin(mockInstance1, mockInstanceAdmin1);
  t.is(await ias.accessor.getInstallation(mockInstance1), mockInstallation1);

  const mockInstanceAdmin2 = Far('mockInstanceAdmin', {});
  await t.throwsAsync(
    async () =>
      ias.updater.initInstanceAdmin(mockInstance1, mockInstanceAdmin2),
    { message: /"\[Alleged: mockInstance\]" already registered/ },
  );
});
