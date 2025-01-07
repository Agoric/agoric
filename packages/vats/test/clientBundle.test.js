import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';
import { E, Far } from '@endo/far';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';

import { makeIssuerKit } from '@agoric/ertp';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeHeapZone } from '@agoric/zone';
import { Stake } from '@agoric/internal/src/tokens.js';
import { connectFaucet, showAmount } from '../src/core/demoIssuers.js';
import { setupClientManager } from '../src/core/chain-behaviors.js';
import { makeAgoricNamesAccess, feeIssuerConfig } from '../src/core/utils.js';
import { makePromiseSpace } from '../src/core/promise-space.js';
import { buildRootObject as mintsRoot } from '../src/vat-mints.js';
import { buildRootObject as boardRoot } from '../src/vat-board.js';
import {
  installBootContracts,
  makeAddressNameHubs,
  makeBoard,
  makeClientBanks,
} from '../src/core/basic-behaviors.js';
import { buildRootObject as buildProvisioningRoot } from '../src/vat-provisioning.js';

import { makePopulatedFakeVatAdmin } from '../tools/boot-test-utils.js';
import { makeNameHubKit, prepareMixinMyAddress } from '../src/nameHub.js';

/**
 * @typedef {{
 *   (n: 'board'): BoardVat;
 *   (n: 'mint'): MintsVat;
 * }} LoadVat
 */
test('connectFaucet produces payments', async t => {
  const space = /** @type {any} */ (makePromiseSpace(t.log));
  /**
   * @type {BootstrapPowers &
   *   DemoFaucetPowers & {
   *     produce: {
   *       loadVat: Producer<LoadVat>;
   *       loadCriticalVat: Producer<LoadVat>;
   *     };
   *   }}
   */
  const { consume, produce } = space;
  const { agoricNames, agoricNamesAdmin, spaces } =
    await makeAgoricNamesAccess();
  produce.agoricNames.resolve(agoricNames);
  produce.agoricNamesAdmin.resolve(agoricNamesAdmin);

  const { zoe, feeMintAccessP, vatAdminSvc } = await setUpZoeForTest({
    feeIssuerConfig,
    vatAdminSvc: makePopulatedFakeVatAdmin().vatAdminService,
  });
  produce.zoe.resolve(zoe);
  const fma = await feeMintAccessP;
  produce.feeMintAccess.resolve(fma);
  produce.bridgeManager.resolve(undefined);

  produce.vatAdminSvc.resolve(vatAdminSvc);

  /** @type {VatLoader<'mints' | 'board'>} */
  const vatLoader = async (name, _sourceRef) => {
    /** @typedef {Awaited<WellKnownVats[typeof name]>} ReturnedVat */
    switch (name) {
      case 'mints':
        return /** @type {ReturnedVat} */ (mintsRoot());
      case 'board': {
        const baggage = makeScalarBigMapStore('baggage');
        return /** @type {ReturnedVat} */ (boardRoot({}, {}, baggage));
      }
      default:
        throw Error('unknown loadVat name');
    }
  };
  produce.loadVat.resolve(vatLoader);
  produce.loadCriticalVat.resolve(vatLoader);

  t.plan(4); // be sure bank.deposit() gets called

  const bldKit = makeIssuerKit(Stake.symbol);
  produce.bldIssuerKit.resolve(bldKit);
  produce.chainStorage.resolve(null);

  const stableIssuer = E(zoe).getFeeIssuer();
  produce.bankManager.resolve(
    Promise.resolve(
      // @ts-expect-error never mind other methods
      Far('mockBankManager', {
        getBankForAddress: async _a =>
          Far('mockBank', {
            // @ts-expect-error never mind other methods
            getPurse: brand => ({
              deposit: async (pmt, _x) => {
                const isBLD = brand === bldKit.brand;
                const issuer = isBLD ? bldKit.issuer : stableIssuer;
                const amt = await E(issuer).getAmountOf(pmt);
                t.is(showAmount(amt), isBLD ? '5_000 BLD' : '53 IST');
                return amt;
              },
            }),
            getAssetSubscription: () => null,
          }),
      }),
    ),
  );

  /** @param {BootstrapSpace} powers */
  const stubProps = async ({ consume: { client } }) => {
    const stub = {
      agoricNames: true,
      namesByAddress: true,
      myAddressNameAdmin: true,
      board: true,
      zoe: true,
    };
    void E(client).assignBundle([_a => stub]);
  };

  await Promise.all([
    // @ts-expect-error missing keys: devices, vats, vatPowers, vatParameters, and 2 more.
    makeBoard({ consume, produce, ...spaces }),
    makeAddressNameHubs({ consume, produce, ...spaces }),
    installBootContracts({ consume, produce, ...spaces }),
    setupClientManager({ consume, produce, ...spaces }),
    connectFaucet({ consume, produce, ...spaces }),
    makeClientBanks({ consume, produce, ...spaces }),
    stubProps({ consume, produce, ...spaces }),
  ]);
  const m = await produce.mints;
  t.truthy(m);

  const userBundle = await E(consume.clientCreator).createUserBundle(
    'nick',
    'address1',
    [],
  );

  // t.deepEqual(Object.keys(userBundle), '@@todo');

  /** @type {import('../src/core/demoIssuers.js').UserPaymentRecord[]} */
  const pmts = await E(userBundle.faucet).tapFaucet();

  const detail = await Promise.all(
    pmts.map(async ({ issuer, payment, pursePetname }) =>
      E(issuer)
        .getAmountOf(payment)
        .then(a => [pursePetname, showAmount(a)]),
    ),
  );
  t.deepEqual(detail, [
    ['Oracle fee', '51 LINK'],
    ['DAI', '1_323 DAI'],
  ]);
});

test('myAddressNameAdmin mixin', async t => {
  const addr = 'agoric123';
  const kit = makeNameHubKit();
  const mixinMyAddress = prepareMixinMyAddress(makeHeapZone());
  const my = mixinMyAddress(kit.nameAdmin, addr);
  t.is(my.getMyAddress(), addr);
});

test('namesByAddressAdmin provideChild', async t => {
  const addr = 'agoric123';
  const baggage = makeScalarBigMapStore('fake baggage', { durable: true });
  const provisioning = buildProvisioningRoot(undefined, undefined, baggage);
  const { namesByAddressAdmin } = await E(provisioning).getNamesByAddressKit();
  /** @type {{ nameAdmin: import('../src/types.js').MyAddressNameAdmin }} */
  // @ts-expect-error XXX why doesn't the provideChild override work?
  const { nameAdmin } = E.get(E(namesByAddressAdmin).provideChild(addr));
  t.is(await E(nameAdmin).getMyAddress(), addr);
});
