// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { E, Far } from '@endo/far';
import {
  makeExportContext,
  makeImportContext,
  makeLoggingPresence,
} from '../src/marshal-contexts.js';

const capData1 = {
  body: JSON.stringify([
    [
      'applyMethod',
      { '@qclass': 'slot', iface: 'Alleged: purse.actions', index: 0 },
      'deposit',
      [{ '@qclass': 'slot', iface: 'Alleged: payment', index: 1 }],
    ],
    ['applyFunction', { '@qclass': 'slot', index: 0 }, [1, 'thing']],
  ]),
  slots: ['purse:1', 'payment:1'],
};

test('makeLoggingPresence logs calls on purse/payment actions', async t => {
  const msgs = [];
  const enqueue = m => msgs.push(m);
  const purse = {
    actions: await makeLoggingPresence('Alleged: purse.actions', enqueue),
  };
  const myPayment = Far('payment', {});
  await E(purse.actions).deposit(myPayment); // promise resolves???
  await E(purse.actions)(1, 'thing');
  t.deepEqual(msgs, [
    ['applyMethod', purse.actions, 'deposit', [myPayment]],
    ['applyFunction', purse.actions, [1, 'thing']],
  ]);

  const ctx = makeExportContext();
  ctx.savePurseActions(purse.actions);
  ctx.savePaymentActions(myPayment);
  const capData = ctx.serialize(harden([...msgs]));
  t.deepEqual(capData, capData1);
});

test('makeImportContext in wallet UI can unserialize messages', async t => {
  const ctx = makeImportContext();

  const stuff = ctx.fromMyWallet.unserialize(capData1);
  t.is(stuff.length, 2);
  t.is(stuff[0][2], 'deposit');
  // const msgs = [];
  // const enqueue = m => msgs.push(m);
  // const purse = {
  //   actions: await makeLoggingPresence('Alleged: purse.actions', enqueue),
  // };
  // const brandM = Far('Moola brand', {});
  // const amt = harden({ brand: brandM, value: 123n });

  // await E(purse.actions).transfer(amt, 'there'); // promise resolves???
  // t.deepEqual(msgs, [
  //   ['applyMethod', purse.actions, 'transfer', [amt, 'there']],
  // ]);
});

//   {
//     type: "WalletReversibleAction",
//     spec: [{
//       json: <bunch of data>,
//       lang: "en-US"
//       readable: "deposit 3 [IST] into [MyPurse] purse"
//     }]
