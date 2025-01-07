// @ts-check
/* global setTimeout */
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { createRequire } from 'module';
import { E, Far } from '@endo/far';
import { makeScalarMapStore } from '@agoric/store';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { makeNameHubKit, makePromiseSpace } from '@agoric/vats';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeWellKnownSpaces } from '@agoric/vats/src/core/utils.js';
import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import { allValues } from '@agoric/internal';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { prepareSmartWallet } from '../src/smartWallet.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const delay = async ms => new Promise(resolve => setTimeout(resolve, ms));

const nodeRequire = createRequire(import.meta.url);
const asset = {
  anyContract: nodeRequire.resolve(
    '@agoric/zoe/src/contracts/automaticRefund.js',
  ),
};

const mockBootstrapPowers = async (
  log,
  spaceNames = ['installation', 'instance', 'issuer', 'brand'],
) => {
  /** @type {import('@agoric/vat-data').Baggage} */
  const baggage = makeScalarMapStore('bootstrap');
  const zone = makeDurableZone(baggage);
  const { produce, consume } = makePromiseSpace();

  const { admin, vatAdminState } = makeFakeVatAdmin();
  const { zoeService: zoe } = makeZoeKitForTest(admin);
  produce.zoe.resolve(zoe);

  const { nameHub: agoricNames, nameAdmin: agoricNamesAdmin } =
    makeNameHubKit();
  produce.agoricNames.resolve(agoricNames);

  const spaces = await makeWellKnownSpaces(agoricNamesAdmin, log, spaceNames);

  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const invitationBrand = await E(invitationIssuer).getBrand();
  spaces.brand.produce.Invitation.resolve(invitationBrand);
  spaces.issuer.produce.Invitation.resolve(invitationIssuer);

  const chainStorage = makeMockChainStorageRoot();
  produce.chainStorage.resolve(chainStorage);

  const board = makeFakeBoard();
  produce.board.resolve(board);

  /** @type {BootstrapPowers} */
  // @ts-expect-error mock
  const powers = { produce, consume, ...spaces, zone };
  const shared = {};

  return { powers, vatAdminState, chainStorage, shared };
};

const makeTestContext = async t => {
  const bootKit = await mockBootstrapPowers(t.log);
  const bundleCache = await makeNodeBundleCache(
    'bundles/',
    {},
    async s => import(s),
  );

  const { agoricNames, board, zoe } = bootKit.powers.consume;
  const startAnyContract = async () => {
    const bundle = await bundleCache.load(asset.anyContract, 'automaticRefund');
    /**
     * @type {Promise<
     *   Installation<import('../src/walletFactory.js').prepare>
     * >}
     */
    const installation = E(zoe).install(bundle);
    return E(zoe).startInstance(installation);
  };
  const { instance: anyInstance } = await startAnyContract();

  const makeSpendableAsset = () => {
    const tok1 = makeIssuerKit('Tok1');
    const { issuer, brand } = bootKit.powers;
    // @ts-expect-error new symbol
    issuer.produce.Token1.resolve(tok1.issuer);
    // @ts-expect-error new symbol
    brand.produce.Token1.resolve(tok1.brand);
    return tok1;
  };
  const spendable = makeSpendableAsset();

  const makeRegistry = async () => {
    /** @type {[string, Brand][]} */
    const be = await E(E(agoricNames).lookup('brand')).entries();
    /** @type {[string, Issuer][]} */
    const ie = await E(E(agoricNames).lookup('issuer')).entries();
    const byName = Object.fromEntries(ie);
    const descriptors = await Promise.all(
      be.map(async ([name, b]) => {
        /** @type {Promise<import('../src/smartWallet.js').BrandDescriptor>} */
        const d = allValues({
          brand: b,
          displayInfo: E(b).getDisplayInfo(),
          issuer: byName[name],
          petname: name,
        });
        return d;
      }),
    );
    /**
     * @type {MapStore<
     *   Brand,
     *   import('../src/smartWallet.js').BrandDescriptor
     * >}
     */
    const store = makeScalarMapStore('registry');
    store.addAll(harden(descriptors.map(d => [d.brand, d])));
    return store;
  };
  /** @type {import('../src/smartWallet.js').BrandDescriptorRegistry} */
  const registry = await makeRegistry();

  /** @type {import('@agoric/vat-data').Baggage} */
  const swBaggage = makeScalarMapStore('smart-wallet');

  const { brand: brandSpace, issuer: issuerSpace } = bootKit.powers;
  /** @type {Issuer<'set'>} */
  // @ts-expect-error cast
  const invitationIssuer = await issuerSpace.consume.Invitation;
  /** @type {Brand<'set'>} */
  // @ts-expect-error cast
  const invitationBrand = await brandSpace.consume.Invitation;
  const invitationDisplayInfo = await E(invitationBrand).getDisplayInfo();
  const publicMarshaller = await E(board).getPublishingMarshaller();
  const makeSmartWallet = prepareSmartWallet(swBaggage, {
    agoricNames,
    invitationBrand,
    invitationDisplayInfo,
    invitationIssuer,
    publicMarshaller,
    zoe,
    registry,
  });

  return { ...bootKit, makeSmartWallet, anyInstance, spendable };
};

test.before(async t => (t.context = await makeTestContext(t)));

test.serial('handle failure to create invitation', async t => {
  const { powers, makeSmartWallet, spendable, shared } = t.context;
  const { chainStorage, board } = powers.consume;
  /** @type {Issuer<'set', InvitationDetails>} */
  // @ts-expect-error cast
  const invitationIssuer = powers.issuer.consume.Invitation;
  const address = 'agoric1234';

  // @ts-expect-error Test setup ensures that chainStorage resolution is not undefined. (see #8247)
  const walletsStorage = E(chainStorage).makeChildNode('wallet');
  const walletStorageNode = await E(walletsStorage).makeChildNode(address);

  const invitationPurse = await E(invitationIssuer).makeEmptyPurse();

  /** @type {() => import('@agoric/vats/src/vat-bank.js').Bank} */
  const makeBank = () =>
    Far('Bank', {
      getPurse: async brand => {
        assert(brand === spendable.brand);
        if (shared.thePurse) return shared.thePurse;

        const purse = await E(spendable.issuer).makeEmptyPurse();
        const amt = AmountMath.make(spendable.brand, 100n);
        const pmt = await E(spendable.mint).mintPayment(amt);
        await E(purse).deposit(pmt);
        const slowWithdrawPurse = {
          ...purse,
          withdraw: async a => {
            await delay(100);
            console.log('@@slow withdraw', a);
            return E(purse).withdraw(a);
          },
          getCurrentAmount: () => purse.getCurrentAmount(),
        };
        return slowWithdrawPurse;
      },
      getAssetSubscription: () => {
        throw Error('TODO');
      },
    });

  const theBank = makeBank();
  shared.thePurse = await theBank.getPurse(spendable.brand);

  const smartWallet = await makeSmartWallet({
    address,
    walletStorageNode,
    bank: theBank,
    invitationPurse,
  });
  shared.theWallet = smartWallet;

  const { anyInstance } = t.context;
  const In = AmountMath.make(spendable.brand, 5n);

  /** @type {import('../src/smartWallet.js').BridgeAction} */
  const spec1 = {
    method: 'executeOffer',
    offer: {
      id: 1,
      invitationSpec: {
        source: 'contract',
        instance: anyInstance,
        publicInvitationMaker: 'noSuchMethod',
      },
      proposal: {
        give: { In },
      },
    },
  };

  const publicMarshaller = await E(board).getPublishingMarshaller();
  const actionCapData = await E(publicMarshaller).toCapData(spec1);
  await t.throwsAsync(E(smartWallet).handleBridgeAction(actionCapData, true));
  await delay(200);
});

test.serial('funds should be back in the purse', async t => {
  t.like(t.context.shared.thePurse.getCurrentAmount(), { value: 100n });
});

test.serial('recover withdrawn payments', async t => {
  const { powers, shared } = t.context;
  const { thePurse, theWallet } = shared;

  /** @type {import('../src/smartWallet.js').BridgeAction} */
  const spec1 = {
    method: 'tryExitOffer',
    offerId: 1,
  };

  const { board } = powers.consume;
  const publicMarshaller = await E(board).getPublishingMarshaller();

  const actionCapData = await E(publicMarshaller).toCapData(spec1);
  await t.throwsAsync(E(theWallet).handleBridgeAction(actionCapData, true), {
    message: /key 1 not found in collection "live offer seats"/,
  });
  await eventLoopIteration();
  await delay(10);
  t.like(thePurse.getCurrentAmount(), { value: 100n });
});
