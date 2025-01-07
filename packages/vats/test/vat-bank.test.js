import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { reincarnate } from '@agoric/swingset-liveslots/tools/setup-vat-data.js';

import { E } from '@endo/far';
import { AmountMath, makeIssuerKit, AssetKind } from '@agoric/ertp';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { makeHeapZone } from '@agoric/zone';
import { subscribeEach } from '@agoric/notifier';
import { buildRootObject } from '../src/vat-bank.js';

/**
 * @import {Remote} from '@agoric/internal';
 * @import {BridgeHandler, ScopedBridgeManager} from '../src/types.js';
 */

const { fakeVomKit } = reincarnate({ relaxDurabilityRules: false });
const provideBaggage = key => {
  const root = fakeVomKit.cm.provideBaggage();
  const zone = makeDurableZone(root);
  return zone.mapStore(`${key} baggage`);
};

test('provideAssetSubscription - MapStore insertion order preserved', async t => {
  const zones = {
    durableZone: makeDurableZone(provideBaggage('key order')),
    heapZone: makeHeapZone(),
  };
  for (const [name, zone] of Object.entries(zones)) {
    const ids = harden(['a', 'b', 'c', 'd', 'e']);
    const handleToId = new Map(
      ids.map(id => [zone.exo(`${name} ${id} handle`, undefined, {}), id]),
    );

    const forwardMap = zone.mapStore(`${name} forward map`);
    for (const [h, id] of handleToId.entries()) {
      forwardMap.init(h, id);
    }
    const forwardMapIds = [...forwardMap.values()];

    const reverseMap = zone.mapStore(`${name} reverse map`);
    for (const [h, id] of [...handleToId.entries()].reverse()) {
      reverseMap.init(h, id);
    }
    const reverseMapIds = [...reverseMap.values()];

    t.deepEqual(
      forwardMapIds,
      ids,
      `${name} forward map insertion order preserved`,
    );
    t.deepEqual(
      reverseMapIds,
      [...ids].reverse(),
      `${name} reverse map insertion order preserved`,
    );
  }
});

test('communication', async t => {
  t.plan(31);
  const baggage = provideBaggage('communication');
  const bankVat = E(buildRootObject)(null, null, baggage);

  const zone = makeDurableZone(baggage);

  /** @type {undefined | Remote<BridgeHandler>} */
  let bankHandler;

  /** @type {ScopedBridgeManager<'bank'>} */
  const bankBridgeMgr = zone.exo('fakeBankBridgeManager', undefined, {
    async fromBridge(obj) {
      t.is(typeof obj, 'string');
    },
    async toBridge(obj) {
      let ret;
      switch (obj.type) {
        case 'VBANK_GET_BALANCE': {
          const { address, denom, type: _type, ...rest } = obj;
          t.is(address, 'agoricfoo');
          t.deepEqual(rest, {});
          if (denom === 'ubld') {
            ret = '11993';
          } else if (denom === 'ufee') {
            ret = '34';
          } else {
            t.fail(`unrecognized denomination ${denom}`);
          }
          break;
        }

        case 'VBANK_GIVE': {
          const { amount, denom, recipient, type: _type, ...rest } = obj;
          t.is(recipient, 'agoricfoo');
          t.is(denom, 'ubld');
          t.is(amount, '14');
          t.deepEqual(rest, {});
          ret = amount;
          break;
        }

        case 'VBANK_GRAB': {
          const { amount, denom, sender, type: _type, ...rest } = obj;
          t.is(sender, 'agoricfoo');
          t.deepEqual(rest, {});
          if (denom === 'ubld') {
            t.is(amount, '14');
            ret = amount;
          } else if (denom === 'ufee') {
            if (BigInt(amount) > 35n) {
              throw Error('insufficient ufee funds');
            } else {
              t.is(amount, '35');
              ret = amount;
            }
          } else {
            t.fail(`unrecognized denomination ${denom}`);
          }
          break;
        }

        case 'VBANK_GIVE_TO_REWARD_DISTRIBUTOR': {
          const { amount, denom, type: _type, ...rest } = obj;
          t.is(denom, 'ufee');
          t.is(amount, '12');
          t.deepEqual(rest, {});
          ret = true;
          break;
        }

        default: {
          t.is(obj, null);
        }
      }
      return ret;
    },
    initHandler(newHandler) {
      bankHandler = newHandler;
    },
    setHandler(newHandler) {
      bankHandler = newHandler;
    },
  });

  // Create a bank manager.
  const bankMgr = await E(bankVat).makeBankManager(bankBridgeMgr);
  const bank = E(bankMgr).getBankForAddress('agoricfoo');

  const sub = await E(bank).getAssetSubscription();
  const it = subscribeEach(sub)[Symbol.asyncIterator]();

  const kit = makeIssuerKit('BLD', AssetKind.NAT, harden({ decimalPlaces: 6 }));
  await t.throwsAsync(async () => E(bank).getPurse(kit.brand), {
    message: /not found/,
  });

  /**
   * @type {undefined
   *   | IteratorResult<{
   *       brand: Brand;
   *       issuer: ERef<Issuer>;
   *       proposedName: string;
   *     }>}
   */
  let itResult;
  const p = it.next().then(r => (itResult = r));
  t.is(itResult, undefined);
  await E(bankMgr).addAsset('ubld', 'BLD', 'Staking Tokens', kit);
  await p;
  t.is(itResult && itResult.done, false);

  // First balance.
  const vpurse = await E(bank).getPurse(kit.brand);
  const bal = await E(vpurse).getCurrentAmount();
  t.assert(AmountMath.isEqual(bal, AmountMath.make(kit.brand, 11993n)));

  // Deposit.
  const paymentAmount = AmountMath.make(kit.brand, 14n);
  const payment = await E(kit.mint).mintPayment(paymentAmount);
  const actualPaymentAmount = await E(vpurse).deposit(payment, paymentAmount);
  t.assert(AmountMath.isEqual(actualPaymentAmount, paymentAmount));

  // Withdrawal.  We can't easily type a `VirtualPurse` unless we make it
  // callable only with `E`, in which case we can't automatically unwrap the
  // return result of `E(vpurse).withdraw` to a sync interface (which `Payment`
  // is).
  //
  // TODO: We can fix this only if the ERTP methods also allow consuming a
  // `Remote<Payment>` instead of just `Payment`.  That typing has not yet been
  // done, hence the cast.
  const payment2 = /** @type {Payment} */ (
    await E(vpurse).withdraw(paymentAmount)
  );
  const actualPaymentAmount2 = await E(kit.issuer).burn(
    payment2,
    paymentAmount,
  );
  t.assert(AmountMath.isEqual(actualPaymentAmount2, paymentAmount));

  // Balance update.
  const notifier = E(vpurse).getCurrentAmountNotifier();
  const updateRecord = await E(notifier).getUpdateSince();
  const balance = { address: 'agoricfoo', denom: 'ubld', amount: '92929' };
  const obj = { type: 'VBANK_BALANCE_UPDATE', updated: [balance] };
  assert(bankHandler);
  await E(bankHandler).fromBridge(obj);

  // Wait for new balance.
  await E(notifier).getUpdateSince(updateRecord.updateCount);
  const bal2 = await E(vpurse).getCurrentAmount();
  t.assert(
    AmountMath.isEqual(
      bal2,
      AmountMath.make(kit.brand, BigInt(balance.amount)),
    ),
  );

  const { mint, ...feeKit } = makeIssuerKit(
    'fee',
    AssetKind.NAT,
    harden({
      decimalPlaces: 6,
    }),
  );

  const backingFee = mint.mintPayment(AmountMath.make(feeKit.brand, 20000000n));
  await E(bankMgr).addAsset('ufee', 'FEE', 'ERTP Fees', {
    ...feeKit,
    payment: backingFee,
  });

  const feePurse = await E(bank).getPurse(feeKit.brand);
  await E(feePurse).withdraw(AmountMath.make(feeKit.brand, 35n));
  await t.throwsAsync(
    async () => E(feePurse).withdraw(AmountMath.make(feeKit.brand, 99n)),
    { instanceOf: Error, message: 'insufficient ufee funds' },
  );

  // Try sending in some fees.
  const feeAmount = AmountMath.make(feeKit.brand, 12n);
  const feePayment = mint.mintPayment(feeAmount);
  const feeReceived = await E(
    E(bankMgr).getRewardDistributorDepositFacet('ufee', feeKit),
  ).receive(feePayment);
  t.assert(AmountMath.isEqual(feeReceived, feeAmount));
});
