// @ts-nocheck
/* eslint @typescript-eslint/no-floating-promises: "warn" */
import '@agoric/swingset-liveslots/tools/prepare-test-env.js';

import path from 'path';

import { E } from '@endo/eventual-send';
import bundleSource from '@endo/bundle-source';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';

import { setupZCFTest } from '../../zcf/setupZcfTest.js';
import { makeRatio } from '../../../../src/contractSupport/index.js';
import { assertAmountsEqual } from '../../../zoeTestHelpers.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * @param {import('ava').ExecutionContext<unknown>} t
 * @param {UserSeat} seat
 * @param {Keyword} keyword
 * @param {IssuerKit} kit
 * @param {Amount} expected
 * @param {string} message
 */
export const checkPayout = async (
  t,
  seat,
  keyword,
  kit,
  expected,
  message = '',
) => {
  const payout = await E(seat).getPayout(keyword);
  const amount = await kit.issuer.getAmountOf(payout);
  t.truthy(AmountMath.isEqual(amount, expected), message);
  t.truthy(seat.hasExited(), message);
};

/**
 * @param {import('ava').ExecutionContext<unknown>} t
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Invitation>} invitation
 * @param {string} expected
 */
export const checkDescription = async (t, zoe, invitation, expected) => {
  const details = await E(zoe).getInvitationDetails(invitation);
  t.is(details.description, expected);
};

/**
 * @param {import('ava').ExecutionContext<unknown>} t
 * @param {ERef<ZoeService>} zoe
 * @param {ERef<Invitation>} invitation
 * @param {InvitationDetails} expectedNullHandle expected invitation
 * details with the handle set to 'null'
 */
export const checkDetails = async (t, zoe, invitation, expectedNullHandle) => {
  const details = await E(zoe).getInvitationDetails(invitation);
  const detailsNullHandle = { ...details, handle: null };
  t.like(detailsNullHandle, expectedNullHandle);
};

/**
 * @param {any} t
 * @param {UserSeat} seat
 * @param {Record<Keyword, IssuerKit>} kitKeywordRecord
 * @param {AmountKeywordRecord} expectedKeywordRecord
 * @param {string} message
 */
export const checkPayouts = async (
  t,
  seat,
  kitKeywordRecord,
  expectedKeywordRecord,
  message = '',
) => {
  const payouts = await E(seat).getPayouts();
  await Promise.all(
    Object.entries(payouts).map(async ([keyword, paymentP]) => {
      const kit = kitKeywordRecord[keyword];
      const amount = await kit.issuer.getAmountOf(paymentP);
      const expected = expectedKeywordRecord[keyword];
      assertAmountsEqual(t, amount, expected);
      t.truthy(
        AmountMath.isEqual(amount, expected),
        `amount value: ${amount.value}, expected value: ${expected.value}, message: ${message}`,
      );
    }),
  );
  t.truthy(seat.hasExited());
};

export const setupLoanUnitTest = async terms => {
  const collateralKit = makeIssuerKit('moola');
  const loanKit = makeIssuerKit('simoleans');

  if (!terms) {
    terms = harden({
      mmr: makeRatio(150n, collateralKit.brand),
      autoswapInstance: {},
    });
  }
  const issuerKeywordRecord = harden({
    Collateral: collateralKit.issuer,
    Loan: loanKit.issuer,
  });

  const { zcf, zoe, installation, instance, vatAdminState } =
    await setupZCFTest(issuerKeywordRecord, terms);

  return {
    zcf,
    zoe,
    collateralKit,
    loanKit,
    installation,
    instance,
    vatAdminState,
  };
};

export const checkNoNewOffers = async (t, zcf) => {
  const newInvitation = zcf.makeInvitation(() => {}, 'noop');
  const zoe = zcf.getZoeService();
  await t.throwsAsync(() => E(zoe).offer(newInvitation), {
    message: 'No further offers are accepted',
  });
};

export const makeSeatKit = async (zcf, proposal, payments) => {
  /** @type {ZCFSeat} */
  let zcfSeat;
  const invitation = zcf.makeInvitation(seat => {
    zcfSeat = seat;
  }, 'seat');
  const zoe = zcf.getZoeService();
  const userSeat = await E(zoe).offer(
    invitation,
    harden(proposal),
    harden(payments),
  );
  return harden({ zcfSeat, userSeat });
};

/**
 * @callback PerformAddCollateral
 * @param {import('ava').ExecutionContext<unknown>} t
 * @param {ZoeService} zoe
 * @param {IssuerKit} collateralKit
 * @param {IssuerKit} loanKit
 * @param {ERef<Payment>} addCollateralInvitation
 * @param {Amount} addedAmount amount of collateral to add
 */
export const performAddCollateral = async (
  t,
  zoe,
  collateralKit,
  loanKit,
  addCollateralInvitation,
  addedAmount,
) => {
  await checkDescription(t, zoe, addCollateralInvitation, 'addCollateral');

  const proposal = harden({
    give: { Collateral: addedAmount },
  });

  const payments = harden({
    Collateral: collateralKit.mint.mintPayment(addedAmount),
  });

  const seat = await E(zoe).offer(addCollateralInvitation, proposal, payments);

  t.is(
    await seat.getOfferResult(),
    'a warm fuzzy feeling that you are further away from default than ever before',
  );

  await checkPayouts(
    t,
    seat,
    { Loan: loanKit, Collateral: collateralKit },
    {
      Loan: AmountMath.makeEmpty(loanKit.brand),
      Collateral: AmountMath.makeEmpty(collateralKit.brand),
    },
    'addCollateralSeat',
  );
};

export const makeAutoswapInstance = async (
  zoe,
  collateralKit,
  loanKit,
  initialLiquidityKeywordRecord,
  vatAdminState,
) => {
  const autoswapRoot = `${dirname}/../../../../src/contracts/autoswap`;

  // Create autoswap installation and instance
  const autoswapBundle = await bundleSource(autoswapRoot);
  vatAdminState.installBundle('b1-autoswap', autoswapBundle);
  const autoswapInstallation = await E(zoe).installBundleID('b1-autoswap');

  const { instance: autoswapInstance, publicFacet } = await E(
    zoe,
  ).startInstance(
    autoswapInstallation,
    harden({ Central: loanKit.issuer, Secondary: collateralKit.issuer }),
  );

  const liquidityIssuer = await E(publicFacet).getLiquidityIssuer();
  const liquidityBrand = await E(liquidityIssuer).getBrand();

  const proposal = harden({
    give: initialLiquidityKeywordRecord,
    want: {
      Liquidity: AmountMath.makeEmpty(liquidityBrand),
    },
  });
  const payment = harden({
    Central: loanKit.mint.mintPayment(initialLiquidityKeywordRecord.Central),
    Secondary: collateralKit.mint.mintPayment(
      initialLiquidityKeywordRecord.Secondary,
    ),
  });

  const seat = await E(zoe).offer(
    E(publicFacet).makeAddLiquidityInvitation(),
    proposal,
    payment,
  );

  await E(seat).getOfferResult();

  return autoswapInstance;
};
