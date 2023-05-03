// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { makeIssuerKit } from '@agoric/ertp';
import { makeZoeKit } from '@agoric/zoe';
import fakeVatAdmin from '@agoric/zoe/tools/fakeVatAdmin.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeBoard } from '@agoric/vats/src/lib-board.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeNameHubKit } from '@agoric/vats/src/nameHub.js';
import { Far } from '@endo/marshal';
import { makeWalletRoot } from '../src/lib-wallet.js';

import '../src/types.js';

function makeFakeMyAddressNameAdmin() {
  const { nameAdmin: rawMyAddressNameAdmin } = makeNameHubKit();
  return Far('fakeMyAddressNameAdmin', {
    ...rawMyAddressNameAdmin,
    getMyAddress() {
      return 'agoric1test1';
    },
  });
}

const setup = async () => {
  const { zoeService: zoe } = makeZoeKit(fakeVatAdmin);
  const board = makeBoard();

  const pursesStateChangeHandler = _data => {};
  const inboxStateChangeHandler = _data => {};

  const { admin: wallet, initialized } = makeWalletRoot({
    zoe,
    board,
    myAddressNameAdmin: makeFakeMyAddressNameAdmin(),
    pursesStateChangeHandler,
    inboxStateChangeHandler,
  });
  await initialized;
  const MOOLA_ISSUER_PETNAME = 'moola';
  const moolaKit = makeIssuerKit(MOOLA_ISSUER_PETNAME);

  const MOOLA_PURSE_PETNAME = 'fun money';

  const issuerManager = wallet.getIssuerManager();
  await issuerManager.add(MOOLA_ISSUER_PETNAME, moolaKit.issuer);
  await wallet.makeEmptyPurse(MOOLA_ISSUER_PETNAME, MOOLA_PURSE_PETNAME);
  return { wallet, moolaKit, MOOLA_ISSUER_PETNAME, MOOLA_PURSE_PETNAME };
};

test('getPursesNotifier', async t => {
  const { wallet, moolaKit, MOOLA_ISSUER_PETNAME, MOOLA_PURSE_PETNAME } =
    await setup();
  const pursesNotifier = wallet.getPursesNotifier();
  const update = await pursesNotifier.getUpdateSince();
  // Has the default Zoe invitation purse and a moola purse
  t.is(update.value.length, 2);
  const moolaPurseInfo = update.value[1];
  t.truthy(moolaPurseInfo.actions);
  t.is(moolaPurseInfo.brand, moolaKit.brand);
  t.is(moolaPurseInfo.brandBoardId, 'board0425');
  t.is(moolaPurseInfo.brandPetname, MOOLA_ISSUER_PETNAME);
  t.deepEqual(moolaPurseInfo.currentAmount, {
    brand: { kind: 'brand', petname: 'moola' }, // not a real amount
    value: 0,
  });
  t.deepEqual(moolaPurseInfo.currentAmountSlots, {
    body: '#{"brand":"$0.Alleged: moola brand","value":"+0"}',
    slots: [
      {
        kind: 'brand',
        petname: 'moola',
      },
    ],
  });
  t.deepEqual(moolaPurseInfo.displayInfo, {
    assetKind: 'nat',
  });
  const moolaPurse = wallet.getPurse(MOOLA_PURSE_PETNAME);
  t.is(moolaPurseInfo.purse, moolaPurse);
  t.is(moolaPurseInfo.pursePetname, MOOLA_PURSE_PETNAME);
  t.is(moolaPurseInfo.value, 0n);
});

test('getAttenuatedPursesNotifier', async t => {
  const { wallet, MOOLA_ISSUER_PETNAME, MOOLA_PURSE_PETNAME, moolaKit } =
    await setup();
  const pursesNotifier = wallet.getAttenuatedPursesNotifier();
  const update = await pursesNotifier.getUpdateSince();
  // Has the default Zoe invitation purse and a moola purse
  t.is(update.value.length, 2);
  const moolaPurseInfo = update.value[1];
  t.false('actions' in moolaPurseInfo);
  t.is(moolaPurseInfo.brand, moolaKit.brand);
  t.is(moolaPurseInfo.brandBoardId, 'board0425');
  t.is(moolaPurseInfo.brandPetname, MOOLA_ISSUER_PETNAME);
  t.deepEqual(moolaPurseInfo.currentAmount, {
    brand: { kind: 'brand', petname: 'moola' }, // not a real amount
    value: 0,
  });
  t.deepEqual(moolaPurseInfo.currentAmountSlots, {
    body: '#{"brand":"$0.Alleged: moola brand","value":"+0"}',
    slots: [
      {
        kind: 'brand',
        petname: 'moola',
      },
    ],
  });
  t.deepEqual(moolaPurseInfo.displayInfo, {
    assetKind: 'nat',
  });

  t.false('purse' in moolaPurseInfo);
  t.is(moolaPurseInfo.pursePetname, MOOLA_PURSE_PETNAME);
  t.is(moolaPurseInfo.value, 0n);
});
