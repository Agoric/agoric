import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { E } from '@endo/far';
import { deeplyFulfilled } from '@endo/marshal';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { AmountMath } from '@agoric/ertp';
import { claim } from '@agoric/ertp/src/legacy-payment-helpers.js';
import centralSupplyBundle from '../bundles/bundle-centralSupply.js';
import { feeIssuerConfig } from '../src/core/utils.js';

/** @import {Installation} from '@agoric/zoe/src/zoeService/utils.js' */
/**
 * @typedef {import('ava').ExecutionContext<{
 *   zoe: ZoeService;
 *   feeMintAccess: FeeMintAccess;
 *   issuer: Record<'IST', Issuer>;
 *   brand: Record<'IST', Brand>;
 *   installation: Record<
 *     'centralSupply',
 *     Installation<import('../src/centralSupply.js').start>
 *   >;
 * }>} CentralSupplyTestContext
 */

test.before(async (/** @type {CentralSupplyTestContext} */ t) => {
  const { zoe, feeMintAccessP } = await setUpZoeForTest({
    feeIssuerConfig,
  });
  const issuer = {
    IST: E(zoe).getFeeIssuer(),
  };
  const brand = {
    IST: E(issuer.IST).getBrand(),
  };

  const installation = {
    centralSupply: E(zoe).install(centralSupplyBundle),
  };

  t.context = await deeplyFulfilled(
    harden({
      zoe,
      feeMintAccess: feeMintAccessP,
      issuer,
      brand,
      installation,
    }),
  );
});

/**
 * @param {CentralSupplyTestContext} t
 * @param {bigint} bootstrapPaymentValue
 */
const startContract = async (t, bootstrapPaymentValue) => {
  const {
    zoe,
    feeMintAccess,
    installation: { centralSupply: centralSupplyInstall },
  } = t.context;

  const terms = {
    bootstrapPaymentValue,
  };
  return E(zoe).startInstance(
    centralSupplyInstall,
    harden({}),
    terms,
    harden({ feeMintAccess }),
  );
};

test('bootstrap payment', async (/** @type {CentralSupplyTestContext} */ t) => {
  const bootstrapPaymentValue = 20000n * 10n ** 6n;
  const {
    issuer: { IST: stableIssuer },
    brand: { IST: stableBrand },
  } = t.context;

  const { creatorFacet } = await startContract(t, bootstrapPaymentValue);

  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const bootstrapAmount = await E(stableIssuer).getAmountOf(bootstrapPayment);

  t.true(
    AmountMath.isEqual(
      bootstrapAmount,
      AmountMath.make(stableBrand, bootstrapPaymentValue),
    ),
  );
});

test('bootstrap payment - only minted once', async (/** @type {CentralSupplyTestContext} */ t) => {
  // This test value is not a statement about the actual value to
  // be minted
  const bootstrapPaymentValue = 20000n * 10n ** 6n;

  const {
    issuer: { IST: istIssuer },
    brand: { IST: istBrand },
  } = t.context;
  const { creatorFacet } = await startContract(t, bootstrapPaymentValue);
  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const issuers = { IST: istIssuer };

  const claimedPayment = await claim(
    E(issuers.IST).makeEmptyPurse(),
    bootstrapPayment,
  );
  const bootstrapAmount = await E(issuers.IST).getAmountOf(claimedPayment);

  t.true(
    AmountMath.isEqual(
      bootstrapAmount,
      AmountMath.make(istBrand, bootstrapPaymentValue),
    ),
  );

  // Try getting another payment

  const bootstrapPayment2 = E(creatorFacet).getBootstrapPayment();

  await t.throwsAsync(
    async () => claim(E(issuers.IST).makeEmptyPurse(), bootstrapPayment2),
    {
      message: /was not a live payment/,
    },
  );
});

test('bootstrap payment - default value is 0n', async (/** @type {CentralSupplyTestContext} */ t) => {
  const {
    issuer: { IST: stableIssuer },
    brand: { IST: stableBrand },
  } = t.context;
  const { creatorFacet } = await startContract(t, 0n);

  const issuers = { IST: stableIssuer };

  const bootstrapPayment = E(creatorFacet).getBootstrapPayment();

  const bootstrapAmount = await E(issuers.IST).getAmountOf(bootstrapPayment);

  t.true(AmountMath.isEqual(bootstrapAmount, AmountMath.make(stableBrand, 0n)));
});

test('bootstrap payment - contract exits', async (/** @type {CentralSupplyTestContext} */ t) => {
  const { adminFacet, creatorFacet } = await startContract(t, 0n);

  const pmt = await E(creatorFacet).getBootstrapPayment();
  t.log({ pmt });
  const completion = await E(adminFacet).getVatShutdownPromise();
  t.log({ completion });
  t.pass();
});
