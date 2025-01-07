// @ts-check
import { test as unknownTest } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { CONTRACT_ELECTORATE, ParamTypes } from '@agoric/governance';
import committeeBundle from '@agoric/governance/bundles/bundle-committee.js';
import { WalletName } from '@agoric/internal';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { publishDepositFacet } from '@agoric/smart-wallet/src/walletFactory.js';
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import centralSupplyBundle from '@agoric/vats/bundles/bundle-centralSupply.js';
import { makeNameHubKit } from '@agoric/vats/src/nameHub.js';
import { PowerFlags } from '@agoric/vats/src/walletFlags.js';
import {
  makeFakeBankKit,
  makeFakeBankManagerKit,
} from '@agoric/vats/tools/bank-utils.js';
import { makeFakeBoard } from '@agoric/vats/tools/board-utils.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio.js';
import { E, Far } from '@endo/far';
import path from 'path';
import { makeHeapZone } from '@agoric/zone';
import { prepareBridgeProvisionTool } from '../src/provisionPoolKit.js';
import {
  makeMockChainStorageRoot,
  setUpZoeForTest,
  withAmountUtils,
} from './supports.js';

/**
 * @import {Bank} from '@agoric/vats/src/vat-bank.js'
 * @import {SmartWallet} from '@agoric/smart-wallet/src/smartWallet.js'
 * @import {WalletReviver} from '@agoric/smart-wallet/src/walletFactory.js'
 */

const pathname = new URL(import.meta.url).pathname;
const dirname = path.dirname(pathname);

const psmRoot = `${dirname}/../src/psm/psm.js`;
const policyRoot = `${dirname}/../src/provisionPool.js`;

const scale6 = x => BigInt(Math.round(x * 1_000_000));

const BASIS_POINTS = 10000n;
const WantMintedFeeBP = 1n;
const GiveMintedFeeBP = 3n;
const MINT_LIMIT = scale6(20_000_000);

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = unknownTest;

const makeTestContext = async () => {
  const bundleCache = await unsafeMakeBundleCache('bundles/');
  const psmBundle = await bundleCache.load(psmRoot, 'psm');
  const policyBundle = await bundleCache.load(policyRoot, 'provisionPool');
  const { zoe, feeMintAccessP } = await setUpZoeForTest();

  const mintedIssuer = await E(zoe).getFeeIssuer();
  /** @type {Brand<'nat'>} */
  const mintedBrand = await E(mintedIssuer).getBrand();
  const anchor = withAmountUtils(makeIssuerKit('aUSD'));

  const committeeInstall = await E(zoe).install(committeeBundle);
  const psmInstall = await E(zoe).install(psmBundle);
  const centralSupply = await E(zoe).install(centralSupplyBundle);
  /** @type {Installation<import('../src/provisionPool.js')['start']>} */
  const policyInstall = await E(zoe).install(policyBundle);

  const mintLimit = AmountMath.make(mintedBrand, MINT_LIMIT);

  const marshaller = makeFakeBoard().getReadonlyMarshaller();

  const storageRoot = makeMockChainStorageRoot();
  const { creatorFacet: committeeCreator } = await E(zoe).startInstance(
    committeeInstall,
    harden({}),
    {
      committeeName: 'Demos',
      committeeSize: 1,
    },
    {
      storageNode: storageRoot.makeChildNode('thisCommittee'),
      marshaller,
    },
  );

  const initialPoserInvitation = await E(committeeCreator).getPoserInvitation();
  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    initialPoserInvitation,
  );

  return {
    bundles: { psmBundle },
    storageRoot,
    zoe: await zoe,
    feeMintAccess: await feeMintAccessP,
    committeeCreator,
    initialPoserInvitation,
    minted: { issuer: mintedIssuer, brand: mintedBrand },
    anchor,
    installs: {
      committeeInstall,
      psmInstall,
      centralSupply,
      provisionPool: policyInstall,
    },
    mintLimit,
    marshaller,
    terms: {
      anchorBrand: anchor.brand,
      anchorPerMinted: makeRatio(100n, anchor.brand, 100n, mintedBrand),
      electionManager: Far('mock election manager'),
      governedParams: {
        [CONTRACT_ELECTORATE]: {
          type: ParamTypes.INVITATION,
          value: invitationAmount,
        },
        GiveMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(GiveMintedFeeBP, mintedBrand, BASIS_POINTS),
        },
        MintLimit: { type: ParamTypes.AMOUNT, value: mintLimit },
        WantMintedFee: {
          type: ParamTypes.RATIO,
          value: makeRatio(WantMintedFeeBP, mintedBrand, BASIS_POINTS),
        },
      },
    },
  };
};

test.before(async t => {
  t.context = await makeTestContext();
});

/** @param {Awaited<ReturnType<typeof makeTestContext>>} context */
const tools = context => {
  const { zoe, anchor, installs, storageRoot } = context;
  // @ts-expect-error missing mint
  const minted = withAmountUtils(context.minted);
  const { assetPublication, bank: poolBank } = makeFakeBankKit([
    minted,
    anchor,
  ]);

  // Each driver needs its own to avoid state pollution between tests
  context.mockChainStorage = makeMockChainStorageRoot();
  const { feeMintAccess, initialPoserInvitation } = context;
  const startPSM = async name => {
    return E(zoe).startInstance(
      installs.psmInstall,
      harden({ AUSD: anchor.issuer }),
      context.terms,
      {
        feeMintAccess,
        initialPoserInvitation,
        storageNode: storageRoot.makeChildNode(name),
        marshaller: makeFakeBoard().getReadonlyMarshaller(),
      },
    );
  };

  const publishAnchorAsset = async () => {
    assetPublication.updateState({
      brand: anchor.brand,
      issuer: anchor.issuer || assert.fail(),
      issuerName: 'USDref',
      denom: 'ibc/toyusdc',
      proposedName: 'toy USDC',
    });
  };
  return { minted, poolBank, startPSM, publishAnchorAsset };
};

test('provisionPool trades provided assets for IST', async t => {
  const { zoe, anchor, installs, storageRoot, committeeCreator } = t.context;

  const { minted, poolBank, startPSM, publishAnchorAsset } = tools(t.context);

  t.log('prepare anchor purse with 100 aUSD');
  const anchorPurse = E(poolBank).getPurse(anchor.brand);
  assert(anchor.mint);
  await E(anchorPurse).deposit(
    await E(anchor.mint).mintPayment(anchor.make(scale6(100))),
  );

  const initialPoserInvitation = await E(committeeCreator).getPoserInvitation();
  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    initialPoserInvitation,
  );

  // mock gov terms
  const govTerms = {
    electionManager: /** @type {any} */ (null),
    initialPoserInvitation,
    governedParams: {
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
      PerAccountInitialAmount: {
        type: ParamTypes.AMOUNT,
        value: minted.make(scale6(0.25)),
      },
    },
  };
  t.log('startInstance(provisionPool)');
  const facets = await E(zoe).startInstance(
    installs.provisionPool,
    {},
    govTerms,
    {
      poolBank,
      initialPoserInvitation,
      storageNode: storageRoot.makeChildNode('provisionPool'),
      marshaller: makeFakeBoard().getReadonlyMarshaller(),
    },
  );

  const metrics = E(facets.publicFacet).getMetrics();

  const {
    head: { value: initialMetrics },
  } = await E(metrics).subscribeAfter();
  t.deepEqual(initialMetrics, {
    totalMintedConverted: minted.make(0n),
    totalMintedProvided: minted.make(0n),
    walletsProvisioned: 0n,
  });

  // storage paths
  const publicTopics = await E(facets.publicFacet).getPublicTopics();
  t.like(publicTopics, { metrics: { description: 'Provision Pool metrics' } });
  t.is(
    await publicTopics.metrics.storagePath,
    'mockChainStorageRoot.provisionPool.metrics',
  );

  t.log('introduce PSM instance to provisionPool');
  const psm = await startPSM('IST-AUSD');
  await E(E(facets.creatorFacet).getLimitedCreatorFacet()).initPSM(
    anchor.brand,
    psm.instance,
  );

  t.log('publish anchor asset to initiate trading');
  await publishAnchorAsset();
  await eventLoopIteration(); // wait for trade

  const mintedPurse = E(poolBank).getPurse(minted.brand);
  const poolBalanceAfter = await E(mintedPurse).getCurrentAmount();
  t.log('post-trade pool balance:', poolBalanceAfter);
  const hundredLessFees = minted.make(
    scale6(100) - WantMintedFeeBP * BASIS_POINTS,
  );
  t.deepEqual(poolBalanceAfter, hundredLessFees);

  const {
    head: { value: postTradeMetrics },
  } = await E(metrics).subscribeAfter();
  t.deepEqual(postTradeMetrics, {
    totalMintedConverted: hundredLessFees,
    totalMintedProvided: minted.make(0n),
    walletsProvisioned: 0n,
  });

  const anchorBalanceAfter = await E(anchorPurse).getCurrentAmount();
  t.log('post-trade anchor balance:', anchorBalanceAfter);
  t.deepEqual(anchorBalanceAfter, anchor.makeEmpty());
});

/**
 * This is a bit of a short-cut; rather than scaffold everything needed to make
 * a walletFactory, we factored out the part that had a bug as
 * `publishDepositFacet` and we make a mock walletFactory that uses it.
 *
 * @param {string[]} addresses
 */
const makeWalletFactoryKitForAddresses = async addresses => {
  const { bankManager } = await makeFakeBankManagerKit();

  const feeKit = makeIssuerKit('FEE');
  const fees = withAmountUtils(feeKit);
  await bankManager.addAsset('ufee', 'FEE', 'FEE', feeKit);

  const sendInitialPayment = async dest => {
    const pmt = fees.mint.mintPayment(fees.make(250n));
    return E(E(dest).getPurse(fees.brand)).deposit(pmt);
  };

  /** @type {Map<string, Promise<Bank>>} */
  const banks = new Map(
    addresses.map(addr => [addr, bankManager.getBankForAddress(addr)]),
  );
  /** @type {Map<string, Purse>} */
  // @ts-expect-error
  const purses = new Map(
    addresses.map(addr => [
      addr,
      E(/** @type {Promise<Bank>} */ (banks.get(addr))).getPurse(fees.brand),
    ]),
  );
  /** @type {Map<string, SmartWallet>} */
  // @ts-expect-error
  const wallets = new Map(
    addresses.map(addr => {
      const purse = /** @type {Purse} */ (purses.get(addr));
      const mockWallet = Far('mock wallet', {
        getDepositFacet: () =>
          Far('mock depositFacet', {
            receive: async payment => E(purse).deposit(payment),
          }),
      });
      return [addr, mockWallet];
    }),
  );

  /** @type {WalletReviver | undefined} */
  let walletReviver;
  /** @param {ERef<WalletReviver>} walletReviverP */
  const setReviver = async walletReviverP => {
    walletReviver = await walletReviverP;
  };

  const done = new Set();
  /** @type {import('@agoric/vats/src/core/startWalletFactory.js').WalletFactoryStartResult['creatorFacet']} */
  const walletFactory = Far('mock walletFactory', {
    provideSmartWallet: async (addr, _b, nameAdmin) => {
      const wallet = wallets.get(addr);
      assert(wallet);

      let isNew = !done.has(addr);
      if (isNew) {
        const isRevive =
          walletReviver && (await E(walletReviver).ackWallet(addr));
        if (isRevive) {
          isNew = false;
        } else {
          await publishDepositFacet(addr, wallet, nameAdmin);
        }
        done.add(addr);
      }
      return [wallet, isNew];
    },
  });

  return {
    fees,
    sendInitialPayment,
    bankManager,
    walletFactory,
    setReviver,
    purses,
  };
};

test('makeBridgeProvisionTool handles duplicate requests', async t => {
  const address = 'addr123';
  t.log('make a wallet factory just for', address);
  const { walletFactory, purses, fees, sendInitialPayment, bankManager } =
    await makeWalletFactoryKitForAddresses([address]);
  const purse = /** @type {Purse} */ (purses.get(address));

  t.log('use makeBridgeProvisionTool to make a bridge handler');
  const { nameHub: namesByAddress, nameAdmin: namesByAddressAdmin } =
    makeNameHubKit();
  const publishMetrics = () => {};
  const zone = makeHeapZone();
  const makeBridgeProvisionTool = prepareBridgeProvisionTool(zone);
  const handler = makeBridgeProvisionTool(
    bankManager,
    walletFactory,
    namesByAddressAdmin,
    Far('helpers', { sendInitialPayment, onProvisioned: publishMetrics }),
  );

  t.log('1st request to provision a SMART_WALLET for', address);
  await handler.fromBridge({
    type: 'PLEASE_PROVISION',
    address,
    powerFlags: PowerFlags.SMART_WALLET,
  });

  t.deepEqual(
    await E(purse).getCurrentAmount(),
    fees.make(250n),
    'received starter funds',
  );
  const myDepositFacet = await namesByAddress.lookup(
    address,
    WalletName.depositFacet,
  );

  t.log('2nd request to provision a SMART_WALLET for', address);
  await handler.fromBridge({
    type: 'PLEASE_PROVISION',
    address,
    powerFlags: PowerFlags.SMART_WALLET,
  });
  t.is(
    myDepositFacet,
    await namesByAddress.lookup(address, WalletName.depositFacet),
    'depositFacet lookup finds the same object',
  );
  t.deepEqual(
    await E(purse).getCurrentAmount(),
    fees.make(500n),
    'received more starter funds',
  );
});

test('provisionPool revives old wallets', async t => {
  const { zoe, installs, storageRoot, committeeCreator } = t.context;

  // make a mock wallet factory and setup its bank
  const oldAddr = 'addr_old';
  const newAddr = 'addr_new';
  const { walletFactory, setReviver, purses, fees, bankManager } =
    await makeWalletFactoryKitForAddresses([oldAddr, newAddr]);
  const oldPurse = /** @type {Purse} */ (purses.get(oldAddr));
  const newPurse = /** @type {Purse} */ (purses.get(newAddr));
  const poolBank = await E(bankManager).getBankForAddress('pool');
  const poolPurse = E(poolBank).getPurse(fees.brand);
  await E(poolPurse).deposit(
    await E(fees.mint).mintPayment(fees.make(scale6(100))),
  );

  // start a provisionPool contract with mock governance terms
  const starterAmount = fees.make(250n);
  const initialPoserInvitation = await E(committeeCreator).getPoserInvitation();
  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    initialPoserInvitation,
  );
  const govTerms = {
    electionManager: /** @type {any} */ (null),
    initialPoserInvitation,
    governedParams: {
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
      PerAccountInitialAmount: {
        type: ParamTypes.AMOUNT,
        value: starterAmount,
      },
    },
  };
  const facets = await E(zoe).startInstance(
    installs.provisionPool,
    {},
    govTerms,
    {
      poolBank,
      initialPoserInvitation,
      storageNode: storageRoot.makeChildNode('provisionPool'),
      marshaller: makeFakeBoard().getReadonlyMarshaller(),
    },
  );
  const creatorFacet = E(facets.creatorFacet).getLimitedCreatorFacet();

  // identify the old address
  await E(creatorFacet).addRevivableAddresses([oldAddr]);

  // make a bridge handler for provisioning wallets
  await E(creatorFacet).setReferences({
    bankManager,
    namesByAddressAdmin: makeNameHubKit().nameAdmin,
    walletFactory,
  });
  const bridgeHandler = await E(creatorFacet).makeHandler();

  // revive the old wallet and verify absence of new starter funds
  const reviverP = E(creatorFacet).getWalletReviver();
  await setReviver(reviverP);
  const reviveWallet = addr => E(reviverP).reviveWallet(addr);
  await t.throwsAsync(
    reviveWallet('addr_unknown'),
    undefined,
    'must not revive wallet for unknown address',
  );
  const oldWallet = await reviveWallet(oldAddr);
  t.deepEqual(
    await E(oldPurse).getCurrentAmount(),
    fees.make(0n),
    'revived wallet must not receive new starter funds',
  );
  const epsilon = fees.make(1n);
  /** @type {any} */
  const epsilonPayment = fees.mint.mintPayment(epsilon);
  await E(E(oldWallet).getDepositFacet()).receive(epsilonPayment);
  t.deepEqual(
    await E(oldPurse).getCurrentAmount(),
    epsilon,
    'revived wallet must be associated with expected purse',
  );

  // provision a new wallet and verify starter funds
  const provisionWallet = address =>
    E(bridgeHandler).fromBridge({
      type: 'PLEASE_PROVISION',
      address,
      powerFlags: PowerFlags.SMART_WALLET,
    });
  await provisionWallet(newAddr);
  t.deepEqual(
    await E(newPurse).getCurrentAmount(),
    starterAmount,
    'new wallet must receive starter funds',
  );
  await t.throwsAsync(
    reviveWallet(newAddr),
    undefined,
    'must not revive wallet for new address',
  );

  // (re)provision a revived wallet
  await provisionWallet(oldAddr);
  t.deepEqual(
    await E(oldPurse).getCurrentAmount(),
    AmountMath.add(epsilon, starterAmount),
    'old wallet received new starter funds',
  );
  await t.throwsAsync(
    reviveWallet(oldAddr),
    undefined,
    'must not re-revive wallet',
  );
});

test('provisionPool publishes metricsOverride promptly', async t => {
  const { zoe, installs, storageRoot, committeeCreator } = t.context;

  const { minted, poolBank } = tools(t.context);

  const initialPoserInvitation = await E(committeeCreator).getPoserInvitation();
  const invitationAmount = await E(E(zoe).getInvitationIssuer()).getAmountOf(
    initialPoserInvitation,
  );

  // mock gov terms
  const govTerms = {
    electionManager: /** @type {any} */ (null),
    initialPoserInvitation,
    governedParams: {
      [CONTRACT_ELECTORATE]: {
        type: ParamTypes.INVITATION,
        value: invitationAmount,
      },
      PerAccountInitialAmount: {
        type: ParamTypes.AMOUNT,
        value: minted.make(scale6(0.25)),
      },
    },
  };

  t.log('startInstance(provisionPool)');
  const facets = await E(zoe).startInstance(
    installs.provisionPool,
    {},
    govTerms,
    {
      poolBank,
      initialPoserInvitation,
      storageNode: storageRoot.makeChildNode('provisionPool'),
      marshaller: makeFakeBoard().getReadonlyMarshaller(),
      metricsOverride: {
        totalMintedConverted: minted.make(20_000_000n),
        totalMintedProvided: minted.make(750_000n),
        walletsProvisioned: 3n,
      },
    },
  );

  // FIXME: remove the 'await null',
  // https://github.com/Agoric/agoric-sdk/issues/9598
  await null;
  const metrics = E(facets.publicFacet).getMetrics();

  const {
    head: { value: initialMetrics },
  } = await E(metrics).subscribeAfter();
  // FIXME fails when fakeVatAdmin.js fixed for non-promise root. Why?
  t.deepEqual(initialMetrics, {
    totalMintedConverted: minted.make(20_000_000n),
    totalMintedProvided: minted.make(750_000n),
    walletsProvisioned: 3n,
  });
});
