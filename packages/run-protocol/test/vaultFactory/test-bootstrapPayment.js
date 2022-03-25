// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import '@agoric/zoe/exported.js';
import '../../src/vaultFactory/types.js';

import path from 'path';
import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { AmountMath } from '@agoric/ertp';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { makeLoopback } from '@endo/captp';

const pathname = new URL(import.meta.url).pathname;
const dirname = path.dirname(pathname);

const centralSupplyRoot = `${dirname}/../../src/centralSupply.js`;

const makeBundle = async sourceRoot => {
  const url = await importMetaResolve(sourceRoot, import.meta.url);
  const contractBundle = await bundleSource(new URL(url).pathname);
  console.log(`makeBundle ${sourceRoot}`);
  return contractBundle;
};

// makeBundle is slow, so we bundle each contract once and reuse in all tests.
const [centralSupplyBundle] = await Promise.all([
  makeBundle(centralSupplyRoot),
]);

const installBundle = (zoe, contractBundle) => E(zoe).install(contractBundle);

const setUpZoeForTest = async setJig => {
  const { makeFar } = makeLoopback('zoeTest');
  const { zoeService, feeMintAccess: nonFarFeeMintAccess } = makeZoeKit(
    makeFakeVatAdmin(setJig).admin,
  );
  /** @type {ERef<ZoeService>} */
  const zoe = makeFar(zoeService);
  const feeMintAccess = await makeFar(nonFarFeeMintAccess);
  return {
    zoe,
    feeMintAccess,
  };
};

const startContract = async bootstrapPaymentValue => {
  const { zoe, feeMintAccess } = await setUpZoeForTest(() => {});
  const runIssuer = E(zoe).getFeeIssuer();
  const runBrand = await E(runIssuer).getBrand();

  /**
   * @type {import('@agoric/zoe/src/zoeService/utils').Installation<
   *   import('../../src/centralSupply.js').CentralSupplyContract
   * >}
   */
  const centralSupplyInstall = await installBundle(zoe, centralSupplyBundle);

  const terms = {
    bootstrapPaymentValue,
  };

  const { creatorFacet } = await E(zoe).startInstance(
    centralSupplyInstall,
    harden({}),
    terms,
    harden({ feeMintAccess }),
  );

  return { runIssuer, creatorFacet, runBrand };
};

test('bootstrap payment', async t => {
  const bootstrapPaymentValue = 20000n * 10n ** 6n;
  const { runIssuer, creatorFacet, runBrand } = await startContract(
    bootstrapPaymentValue,
  );

  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const bootstrapAmount = await E(runIssuer).getAmountOf(bootstrapPayment);

  t.true(
    AmountMath.isEqual(
      bootstrapAmount,
      AmountMath.make(runBrand, bootstrapPaymentValue),
    ),
  );
});

test('bootstrap payment - only minted once', async t => {
  // This test value is not a statement about the actual value to
  // be minted
  const bootstrapPaymentValue = 20000n * 10n ** 6n;

  const { runIssuer, creatorFacet, runBrand } = await startContract(
    bootstrapPaymentValue,
  );

  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const issuers = { RUN: runIssuer };

  const claimedPayment = await E(issuers.RUN).claim(bootstrapPayment);
  const bootstrapAmount = await E(issuers.RUN).getAmountOf(claimedPayment);

  t.true(
    AmountMath.isEqual(
      bootstrapAmount,
      AmountMath.make(runBrand, bootstrapPaymentValue),
    ),
  );

  // Try getting another payment

  const bootstrapPayment2 = E(creatorFacet).getBootstrapPayment();

  await t.throwsAsync(() => E(issuers.RUN).claim(bootstrapPayment2), {
    message: /was not a live payment/,
  });
});

test('bootstrap payment - default value is 0n', async t => {
  const { runIssuer, creatorFacet, runBrand } = await startContract(0n);

  const issuers = { RUN: runIssuer };

  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const bootstrapAmount = await E(issuers.RUN).getAmountOf(bootstrapPayment);

  t.true(AmountMath.isEqual(bootstrapAmount, AmountMath.make(runBrand, 0n)));
});
