import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath } from '@agoric/ertp';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { SIMULATED_ERRORS } from '@agoric/vats/tools/fake-bridge.js';
import { heapVowE as E } from '@agoric/vow/vat.js';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import path from 'path';
import { commonSetup } from '../supports.js';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractFile = `${dirname}/../../src/examples/stake-bld.contract.js`;
type StartFn =
  typeof import('@agoric/orchestration/src/examples/stake-bld.contract.js').start;

const startContract = async ({
  agoricNames,
  timer,
  localchain,
  marshaller,
  storage,
  bld,
}) => {
  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);

  const { publicFacet } = await E(zoe).startInstance(
    installation,
    { In: bld.issuer },
    {},
    {
      agoricNames,
      localchain,
      marshaller,
      storageNode: storage.rootNode,
      timerService: timer,
    },
  );
  return { publicFacet, zoe };
};

test('makeAccount, deposit, withdraw', async t => {
  const {
    bootstrap,
    brands: { bld },
    commonPrivateArgs: { marshaller },
    utils,
  } = await commonSetup(t);
  const { publicFacet, zoe } = await startContract({
    ...bootstrap,
    bld,
    marshaller,
  });

  t.log('make a LocalChainAccount');
  const account = await E(publicFacet).makeAccount();
  t.truthy(account, 'account is returned');

  t.log('deposit 100 bld to account');
  const depositResp = await E(account).deposit(
    await utils.pourPayment(bld.units(100)),
  );
  t.deepEqual(await E(account).getBalance('ubld'), {
    denom: 'ubld',
    value: bld.units(100).value,
  });

  // XXX races in the bridge
  await eventLoopIteration();

  t.log('withdraw bld from account');
  const withdrawResp = await E(account).withdraw(bld.units(100));
  const withdrawAmt = await bld.issuer.getAmountOf(withdrawResp);
  t.true(AmountMath.isEqual(withdrawAmt, bld.units(100)), 'withdraw');

  await t.throwsAsync(
    async () => E(account).withdraw(bld.units(100)),
    undefined, // fake bank error messages don't match production
    'cannot withdraw more than balance',
  );
});

test('makeStakeBldInvitation', async t => {
  const {
    bootstrap,
    brands: { bld },
    commonPrivateArgs: { marshaller },
    utils,
  } = await commonSetup(t);
  const { publicFacet, zoe } = await startContract({
    ...bootstrap,
    bld,
    marshaller,
  });

  t.log('call makeStakeBldInvitation');
  const inv = await E(publicFacet).makeStakeBldInvitation();

  const hundred = bld.make(1_000_000_000n);

  t.log('make an offer for an account');
  // Want empty until (at least) #9087
  const userSeat = await E(zoe).offer(
    inv,
    { give: { In: hundred } },
    { In: utils.pourPayment(hundred) },
  );
  const { invitationMakers } = await E(userSeat).getOfferResult();
  t.truthy(invitationMakers, 'received continuing invitation');

  t.log('make Delegate offer using invitationMakers');
  {
    const delegateInv = await E(invitationMakers).Delegate(
      'agoric1validator1',
      {
        brand: bld.brand,
        value: 1_000_000_000n,
      },
    );
    const delegateOffer = await E(zoe).offer(delegateInv);
    const res = await E(delegateOffer).getOfferResult();
    t.deepEqual(res, {});
    t.log('Successfully delegated');
  }

  t.log('example Delegate offer rejection');
  {
    const delegateInv = await E(invitationMakers).Delegate(
      'agoric1validator1',
      {
        brand: bld.brand,
        value: SIMULATED_ERRORS.TIMEOUT,
      },
    );
    const delegateOffer = await E(zoe).offer(delegateInv);
    await t.throwsAsync(E(delegateOffer).getOfferResult(), {
      message: 'simulated packet timeout',
    });
  }

  await t.throwsAsync(async () => E(invitationMakers).CloseAccount(), {
    message: 'not yet implemented',
  });
});

test('makeAccountInvitationMaker', async t => {
  const {
    bootstrap,
    brands: { bld },
    commonPrivateArgs: { marshaller },
    utils,
  } = await commonSetup(t);
  const { publicFacet, zoe } = await startContract({
    ...bootstrap,
    bld,
    marshaller,
  });

  const inv = await E(publicFacet).makeAccountInvitationMaker();

  const userSeat = await E(zoe).offer(inv);
  const offerResult = await E(userSeat).getOfferResult();
  t.truthy('invitationMakers' in offerResult, 'received continuing invitation');
  t.like(offerResult.publicSubscribers, {
    account: {
      description: 'Account holder status',
      storagePath: 'mockChainStorageRoot',
    },
  });
});
