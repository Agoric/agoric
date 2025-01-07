import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import path from 'path';

import { assert, X } from '@endo/errors';
import bundleSource from '@endo/bundle-source';
import { Far } from '@endo/marshal';
import { E } from '@endo/eventual-send';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';

import { makeFakeVatAdmin } from '../../../tools/fakeVatAdmin.js';
import { makeZoeForTest } from '../../../tools/setup-zoe.js';

/**
 * @typedef {object} TestContext
 * @property {ZoeService} zoe
 * @property {(t: ExecutionContext) => Promise<OracleKit>} makePingOracle
 * @property {Amount} feeAmount
 * @property {IssuerKit} link
 *
 * @typedef {import('ava').ExecutionContext<TestContext>} ExecutionContext
 */

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractPath = `${dirname}/../../../src/contracts/oracle.js`;

test.before(
  'setup oracle',
  /** @param {ExecutionContext} ot */ async ot => {
    // Outside of tests, we should use the long-lived Zoe on the
    // testnet. In this test, we must create a new Zoe.
    const { admin, vatAdminState } = makeFakeVatAdmin();
    const zoe = makeZoeForTest(admin);

    // Pack the contract.
    const contractBundle = await bundleSource(contractPath);
    vatAdminState.installBundle('b1-oracle', contractBundle);

    const link = makeIssuerKit('$LINK', AssetKind.NAT);

    // Install the contract on Zoe, getting an installation. We can
    // use this installation to look up the code we installed. Outside
    // of tests, we can also send the installation to someone
    // else, and they can use it to create a new contract instance
    // using the same code.
    /** @type {Installation<import('../../../src/contracts/oracle.js').OracleStart>} */
    const installation = await E(zoe).installBundleID('b1-oracle');

    const feeAmount = AmountMath.make(link.brand, 1000n);
    /**
     * @param {ExecutionContext} _t
     * @returns {Promise<OracleKit>}
     */
    const makePingOracle = async _t => {
      /** @type {OracleHandler} */
      const oracleHandler = Far('OracleHandler', {
        async onQuery(query, fee) {
          let requiredFee;
          if (query.kind === 'Paid') {
            requiredFee = feeAmount;
            AmountMath.isGTE(fee, requiredFee) ||
              assert.fail(X`Minimum fee of ${feeAmount} not met; have ${fee}`);
          }
          const reply = { pong: query };
          return harden({ reply, requiredFee });
        },
        async onError(_query, _reason) {
          // do nothing
        },
        async onReply(_query, _reply, _fee) {
          // do nothing
        },
      });

      const startResult = await E(zoe).startInstance(
        installation,
        { Fee: link.issuer },
        { oracleDescription: 'myOracle' },
      );
      const creatorFacet = await E(startResult.creatorFacet).initialize({
        oracleHandler,
      });

      return harden({
        ...startResult,
        creatorFacet,
      });
    };

    ot.context.zoe = zoe;
    ot.context.makePingOracle = makePingOracle;
    ot.context.feeAmount = feeAmount;
    ot.context.link = link;
  },
);

test('single oracle', /** @param {ExecutionContext} t */ async t => {
  const { zoe, link, makePingOracle, feeAmount } = t.context;

  // Get the Zoe invitation issuer from Zoe.
  const invitationIssuer = E(zoe).getInvitationIssuer();

  const { creatorFacet: pingCreator, publicFacet } = await makePingOracle(t);

  const query1 = { kind: 'Free', data: 'foo' };
  const query2 = { kind: 'Paid', data: 'bar' };
  const query3 = { kind: 'Paid', data: 'baz' };
  const query4 = { kind: 'Paid', data: 'bot' };

  const freeReply = E(publicFacet).query({ hello: 'World' });
  const invitation1 = E(publicFacet).makeQueryInvitation(query1);
  const invitation2 = E(publicFacet).makeQueryInvitation(query2);
  const invitation3 = E(publicFacet).makeQueryInvitation(query3);
  const invitation4 = E(publicFacet).makeQueryInvitation(query4);

  // Ensure all the invitations actually are real Zoe invitations.
  t.truthy(await E(invitationIssuer).isLive(invitation1));
  t.truthy(await E(invitationIssuer).isLive(invitation2));
  t.truthy(await E(invitationIssuer).isLive(invitation3));
  t.truthy(await E(invitationIssuer).isLive(invitation4));

  const getCustomDetailsQuery = async inv => {
    const amt = await E(invitationIssuer).getAmountOf(inv);
    return amt.value[0].customDetails?.query;
  };

  t.deepEqual(await getCustomDetailsQuery(invitation1), query1);
  t.deepEqual(await getCustomDetailsQuery(invitation2), query2);
  t.deepEqual(await getCustomDetailsQuery(invitation3), query3);
  t.deepEqual(await getCustomDetailsQuery(invitation4), query4);

  const offer = E(zoe).offer(invitation1);

  // Ensure our oracle handles $LINK.
  const overAmount = AmountMath.add(
    feeAmount,
    AmountMath.make(link.brand, 799n),
  );
  const offer3 = E(zoe).offer(
    invitation3,
    harden({ give: { Fee: overAmount } }),
    harden({
      Fee: link.mint.mintPayment(overAmount),
    }),
  );

  t.deepEqual(await freeReply, {
    pong: { hello: 'World' },
  });

  // Check the free result.
  t.deepEqual(await E(offer).getOfferResult(), {
    pong: { kind: 'Free', data: 'foo' },
  });

  // Check the overpaid result.
  t.deepEqual(await E(offer3).getOfferResult(), {
    pong: { kind: 'Paid', data: 'baz' },
  });
  t.deepEqual(
    await link.issuer.getAmountOf(E(offer3).getPayout('Fee')),
    AmountMath.subtract(overAmount, feeAmount),
  );

  // Check the unpaid result.
  const offer2 = E(zoe).offer(invitation2);

  // Check the underpaid result.
  const underAmount = AmountMath.make(link.brand, 500n);
  const offer4 = E(zoe).offer(
    invitation4,
    harden({ give: { Fee: underAmount } }),
    harden({
      Fee: link.mint.mintPayment(underAmount),
    }),
  );

  await t.throwsAsync(async () => E(offer2).getOfferResult(), {
    instanceOf: Error,
  });
  await t.throwsAsync(async () => E(offer4).getOfferResult(), {
    instanceOf: Error,
  });
  t.deepEqual(
    await link.issuer.getAmountOf(E(offer4).getPayout('Fee')),
    underAmount,
  );

  const withdrawSome = E(pingCreator).makeWithdrawInvitation();
  const withdrawOffer = E(zoe).offer(
    withdrawSome,
    harden({
      want: { Fee: AmountMath.make(link.brand, 201n) },
    }),
  );
  t.is(await E(withdrawOffer).getOfferResult(), 'Successfully withdrawn');

  const shutdownInvitation = E(pingCreator).makeShutdownInvitation();
  const shutdownSeat = E(zoe).offer(shutdownInvitation);

  await E(shutdownSeat)
    .getPayouts()
    .then(async payouts =>
      Promise.all(
        Object.entries(payouts).map(async ([keyword, payment]) => {
          const amount = await link.issuer.getAmountOf(payment);
          return [keyword, amount];
        }),
      ),
    )
    .then(kvals => {
      t.deepEqual(kvals, [['Fee', AmountMath.make(link.brand, 799n)]]);
    });

  const badInvitation = E(publicFacet).makeQueryInvitation({
    hello: 'nomore',
  });
  const badOffer = E(zoe).offer(badInvitation);

  // Ensure the oracle no longer functions after revocation.
  await t.throwsAsync(async () => E(badOffer).getOfferResult(), {
    instanceOf: Error,
    message: `No further offers are accepted`,
  });

  await t.throwsAsync(
    async () => E(publicFacet).query({ hello: 'not again' }),
    {
      instanceOf: Error,
      message: `Oracle revoked`,
    },
  );

  t.deepEqual(
    await link.issuer.getAmountOf(E(withdrawOffer).getPayout('Fee')),
    AmountMath.make(link.brand, 201n),
  );
});
