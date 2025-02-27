import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import type { TestFn } from 'ava';

import path from 'path';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeIssuerKit } from '@agoric/ertp';
import {
  type AmountUtils,
  withAmountUtils,
} from '@agoric/zoe/tools/test-utils.js';
import type { Issuer } from '@agoric/ertp/src/types.js';
import { E, type EReturn } from '@endo/far';
import {
  LOCALCHAIN_DEFAULT_ADDRESS,
  SIMULATED_ERRORS,
} from '@agoric/vats/tools/fake-bridge.js';
import { commonSetup } from '../supports.js';
import type { ChainAddress } from '../../src/orchestration-api.ts';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const contractName = 'zoeTools';
const contractFile = `${dirname}/../../test/fixtures/zoe-tools.contract.js`;
type StartFn = typeof import('../../test/fixtures/zoe-tools.contract.js').start;

type TestContext = EReturn<typeof commonSetup> & {
  brands: EReturn<typeof commonSetup>['brands'] & {
    moolah: AmountUtils;
  };
  zoe: ZoeService;
  contractKit: StartedInstanceKit<StartFn>;
  getIssuer: (keyword: string) => Issuer<'nat'>;
};

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async t => {
  t.log('bootstrap, orchestration core-eval');
  const common = await commonSetup(t);
  const {
    bootstrap,
    commonPrivateArgs,
    brands: { ist, bld },
  } = common;

  const moolah = withAmountUtils(makeIssuerKit('MOO'));
  t.log('Making Moolah issuer kit', moolah);

  t.log('contract coreEval', contractName);
  const { zoe, bundleAndInstall } = await setUpZoeForTest();
  const installation: Installation<StartFn> =
    await bundleAndInstall(contractFile);

  const issuerKeywordRecord = harden({
    IST: ist.issuer,
    BLD: bld.issuer,
    MOO: moolah.issuer,
  });
  t.log('issuerKeywordRecord', issuerKeywordRecord);

  const storageNode = await E(bootstrap.storage.rootNode).makeChildNode(
    contractName,
  );
  const contractKit = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    {},
    { ...commonPrivateArgs, storageNode },
  );

  const getIssuer = (key: string) => issuerKeywordRecord[key] as Issuer<'nat'>;

  t.context = {
    ...common,
    brands: {
      ...common.brands,
      moolah,
    },
    contractKit,
    getIssuer,
    zoe,
  };
});

/**
 * Tests to ensure `localTransfer` recovers when presented non-vbank asset(s)
 * Also tests withdrawSeat, as it's used in the recovery path.
 */
test('zoeTool.localTransfer error paths', async t => {
  const {
    bootstrap,
    brands: { ist, bld, moolah },
    utils: { pourPayment },
    contractKit,
    zoe,
    getIssuer,
  } = t.context;
  const publicFacet = await E(zoe).getPublicFacet(contractKit.instance);
  const vt = bootstrap.vowTools;

  const destAddr: ChainAddress = {
    chainId: 'agoriclocal',
    value: 'agoric1testrecipient',
  };

  t.log('localTransfer recovers when presented non-vbank asset');
  {
    const tenMoolah = moolah.make(10n);
    const MOO = await E(moolah.mint).mintPayment(tenMoolah);
    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositSendInvitation(),
      { give: { MOO: tenMoolah } },
      { MOO },
      {
        destAddr,
      },
    );
    await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
      message:
        'One or more deposits failed ["[Error: key \\"[Alleged: MOO brand]\\" not found in collection \\"brandToAssetRecord\\"]"]',
    });
    await E(userSeat).tryExit();
    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    t.is(payoutEntries.length, 1, 'expecting 1 MOO payout');
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(payment.value, 10n, `${kw} payment returned`);
    }
  }

  t.log('localTransfer recovers from: give: { IST, MOO }');
  {
    const tenMoolah = moolah.make(10n);
    const MOO = await E(moolah.mint).mintPayment(tenMoolah);
    const tenStable = ist.make(10n);
    const IST = await pourPayment(tenStable);
    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositSendInvitation(),
      { give: { IST: tenStable, MOO: tenMoolah } },
      { IST, MOO },
      {
        destAddr,
      },
    );
    await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
      message:
        'One or more deposits failed ["[Error: key \\"[Alleged: MOO brand]\\" not found in collection \\"brandToAssetRecord\\"]"]',
    });
    await E(userSeat).tryExit();
    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    t.is(payoutEntries.length, 2, 'expecting IST, MOO payouts');
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(payment.value, 10n, `${kw} payment returned`);
    }
  }

  t.log('localTransfer recovers from: give: { BLD, MOO, IST } ');
  {
    const tenMoolah = moolah.make(10n);
    const MOO = await E(moolah.mint).mintPayment(tenMoolah);
    const tenStable = ist.make(10n);
    const IST = await pourPayment(tenStable);
    const tenStake = bld.make(10n);
    const BLD = await pourPayment(tenStake);
    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositSendInvitation(),
      { give: { BLD: tenStake, MOO: tenMoolah, IST: tenStable } },
      { BLD, MOO, IST },
      {
        destAddr,
      },
    );
    await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
      message:
        'One or more deposits failed ["[Error: key \\"[Alleged: MOO brand]\\" not found in collection \\"brandToAssetRecord\\"]"]',
    });
    await E(userSeat).tryExit();
    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    t.is(payoutEntries.length, 3, 'expecting BLD, IST, MOO payouts');
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(payment.value, 10n, `${kw} payment returned`);
    }
  }
  t.log('withdrawToSeat recovers from: simulated sendAll failure ');
  {
    const tenStable = ist.make(SIMULATED_ERRORS.BAD_REQUEST);
    const IST = await pourPayment(tenStable);
    const tenStake = bld.make(SIMULATED_ERRORS.BAD_REQUEST);
    const BLD = await pourPayment(tenStake);
    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositSendInvitation(),
      { give: { BLD: tenStake, IST: tenStable } },
      { BLD, IST },
      {
        destAddr,
      },
    );
    await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
      message: 'SendAll failed "[Error: simulated error]"',
    });
    await E(userSeat).hasExited();
    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    t.is(payoutEntries.length, 2, 'expecting BLD, IST payouts');
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(
        payment.value,
        SIMULATED_ERRORS.BAD_REQUEST,
        `${kw} payment returned`,
      );
    }
  }
});

test('localTransfer happy path', async t => {
  const {
    bootstrap,
    brands: { ist, bld },
    utils: { pourPayment, inspectBankBridge, inspectLocalBridge },
    contractKit,
    zoe,
    getIssuer,
  } = t.context;
  const publicFacet = await E(zoe).getPublicFacet(contractKit.instance);
  const vt = bootstrap.vowTools;

  const destAddr: ChainAddress = {
    chainId: 'agoriclocal',
    value: 'agoric1testrecipient',
  };

  const tenStable = ist.make(10n);
  const tenStake = bld.make(10n);

  const expectedAmounts = [
    {
      denom: 'ubld',
      amount: '10',
    },
    {
      denom: 'uist',
      amount: '10',
    },
  ];

  {
    t.log('localTransfer happy path via depositAndSend');
    const IST = await pourPayment(tenStable);
    const BLD = await pourPayment(tenStake);

    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositSendInvitation(),
      { give: { BLD: tenStake, IST: tenStable } },
      { BLD, IST },
      {
        destAddr,
      },
    );

    await vt.when(E(userSeat).getOfferResult());
    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    t.is(payoutEntries.length, 2, 'expecting BLD, IST payouts');
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(payment.value, 0n, `no payout for ${kw}`);
    }

    t.like(
      inspectBankBridge().filter(m => m.type === 'VBANK_GIVE'),
      expectedAmounts.map(x => ({
        ...x,
        recipient: LOCALCHAIN_DEFAULT_ADDRESS,
      })),
      'funds deposited to contract LCA',
    );
    t.like(
      inspectLocalBridge().find(x => x.type === 'VLOCALCHAIN_EXECUTE_TX')
        ?.messages?.[0],
      {
        '@type': '/cosmos.bank.v1beta1.MsgSend',
        fromAddress: LOCALCHAIN_DEFAULT_ADDRESS,
        toAddress: destAddr.value,
        amount: expectedAmounts,
      },
      'sendAll sent',
    );
  }
  {
    t.log('localTransfer happy path via deposit');
    const IST = await pourPayment(tenStable);
    const BLD = await pourPayment(tenStake);

    const userSeat = await E(zoe).offer(
      E(publicFacet).makeDepositInvitation(),
      { give: { BLD: tenStake, IST: tenStable } },
      { BLD, IST },
    );

    await vt.when(E(userSeat).getOfferResult());

    const payouts = await E(userSeat).getPayouts();
    const payoutEntries = Object.entries(payouts);
    for (const [kw, pmt] of payoutEntries) {
      const payment = await getIssuer(kw).getAmountOf(pmt);
      t.is(payment.value, 0n, `no payout for ${kw}`);
    }

    t.like(
      inspectBankBridge().filter(m => m.type === 'VBANK_GIVE'),
      expectedAmounts.map(x => ({
        ...x,
        recipient: LOCALCHAIN_DEFAULT_ADDRESS,
      })),
      'funds deposited to contract LCA',
    );
  }
});

test('withdraw (withdrawToSeat) from LCA with insufficient balance', async t => {
  const {
    bootstrap,
    brands: { ist, bld },
    contractKit,
    zoe,
  } = t.context;
  const publicFacet = await E(zoe).getPublicFacet(contractKit.instance);
  const vt = bootstrap.vowTools;

  const tenStable = ist.make(10n);
  const tenStake = bld.make(10n);

  const userSeat = await E(zoe).offer(E(publicFacet).makeWithdrawInvitation(), {
    want: { BLD: tenStake, IST: tenStable },
  });

  await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
    message:
      'One or more withdrawals failed ["[RangeError: -10 is negative]","[RangeError: -10 is negative]"]',
  });
});

test('withdraw (withdrawToSeat) happy path', async t => {
  const {
    bootstrap,
    brands: { ist, bld },
    contractKit,
    zoe,
    getIssuer,
    utils: { pourPayment },
  } = t.context;
  const publicFacet = await E(zoe).getPublicFacet(contractKit.instance);
  const vt = bootstrap.vowTools;

  const tenStable = ist.make(10n);
  const tenStake = bld.make(10n);

  t.log('ensure contract LCA has funds to withdraw');
  const IST = await pourPayment(tenStable);
  const BLD = await pourPayment(tenStake);

  const depositSeat = await E(zoe).offer(
    E(publicFacet).makeDepositInvitation(),
    { give: { BLD: tenStake, IST: tenStable } },
    { BLD, IST },
  );
  await vt.when(E(depositSeat).getOfferResult());

  const withdrawSeat = await E(zoe).offer(
    E(publicFacet).makeWithdrawInvitation(),
    {
      want: { BLD: tenStake, IST: tenStable },
    },
  );
  await vt.when(E(withdrawSeat).getOfferResult());

  const payouts = await E(withdrawSeat).getPayouts();
  const payoutEntries = Object.entries(payouts);
  t.is(payoutEntries.length, 2, 'expecting BLD, IST payouts');
  for (const [kw, pmt] of payoutEntries) {
    const payment = await getIssuer(kw).getAmountOf(pmt);
    t.is(payment.value, 10n, `${kw} payment given`);
  }
});

test('withdrawToSeat, unknown brand', async t => {
  const {
    bootstrap,
    brands: { moolah },
    contractKit,
    zoe,
  } = t.context;
  const publicFacet = await E(zoe).getPublicFacet(contractKit.instance);
  const vt = bootstrap.vowTools;

  const tenMoolah = moolah.make(10n);

  const userSeat = await E(zoe).offer(E(publicFacet).makeWithdrawInvitation(), {
    want: { MOO: tenMoolah },
  });

  await t.throwsAsync(vt.when(E(userSeat).getOfferResult()), {
    message:
      'One or more withdrawals failed ["[Error: key \\"[Alleged: MOO brand]\\" not found in collection \\"brandToAssetRecord\\"]"]',
  });
});
