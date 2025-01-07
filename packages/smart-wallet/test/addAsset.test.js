// @ts-check
import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { Fail } from '@endo/errors';
import { E, Far } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import bundleSource from '@endo/bundle-source';
import { makeMarshal } from '@endo/marshal';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeCopyBag } from '@agoric/store';
import { resolve as importMetaResolve } from 'import-meta-resolve';
import { makeFakeBankManagerKit } from '@agoric/vats/tools/bank-utils.js';
import { makeDefaultTestContext } from './contexts.js';
import { ActionType, headValue, makeMockTestSpace } from './supports.js';
import { makeImportContext } from '../src/marshal-contexts.js';

const importSpec = async spec =>
  importMetaResolve(spec, import.meta.url).then(u => new URL(u).pathname);

/**
 * @type {import('ava').TestFn<
 *   Awaited<ReturnType<makeDefaultTestContext>>
 * >}
 */
const test = anyTest;

test.before(async t => {
  const withBankManager = async () => {
    const { bankManager } = await makeFakeBankManagerKit();
    const noop = () => {};
    const space0 = await makeMockTestSpace(noop);
    space0.produce.bankManager.reset();
    space0.produce.bankManager.resolve(bankManager);
    return space0;
  };
  t.context = await makeDefaultTestContext(t, withBankManager);
});

const LOG_NEWS_HEAD = false;
const bigIntReplacer = (_key, val) =>
  typeof val === 'bigint' ? Number(val) : val;

const range = qty => [...Array(qty).keys()];

// We use test.serial() because
// agoricNames and vstorage are shared mutable state.

/**
 * NOTE: this doesn't test all forms of work. A better test would measure
 * inter-vat messages or some such.
 */
test.serial('avoid O(wallets) storage writes for a new asset', async t => {
  const bankManager = t.context.consume.bankManager;

  let chainStorageWrites = 0;

  const startUser = async ix => {
    const address = `agoric1u${ix}`;
    const smartWallet = t.context.simpleProvideWallet(address);

    // stick around waiting for things to happen
    const current = await E(smartWallet).getCurrentSubscriber();
    /** @type {bigint | undefined} */
    let publishCount;
    for (;;) {
      const news = await E(current).subscribeAfter(publishCount);
      publishCount = news.publishCount;
      chainStorageWrites += 1;
      if (LOG_NEWS_HEAD) {
        console.log(JSON.stringify(news.head, bigIntReplacer, 2));
      }
    }
  };

  const simulate = async (qty, denom, name) => {
    for (const idx of range(qty)) {
      void startUser(idx);
    }
    await eventLoopIteration();
    const initialWrites = chainStorageWrites;

    const kit = makeIssuerKit(name);
    await E(bankManager).addAsset(denom, name, name, kit);
    await eventLoopIteration();
    return {
      qty,
      initialWrites,
      addedWrites: chainStorageWrites - initialWrites,
    };
  };
  const base = await simulate(2, 'ibc/dai1', 'DAI_axl');
  const exp = await simulate(6, 'ibc/dai2', 'DAI_grv');

  t.true(
    exp.addedWrites <= (base.addedWrites * exp.qty) / base.qty / 2,
    'actual writes should be less than half of linear growth',
  );

  // a stronger requirement for Cosmos balances, though that's
  // the only kind of balance we have yet.
  t.is(base.addedWrites, 0);
  t.is(exp.addedWrites, 0);
});

const BOARD_AUX = 'boardAux';
/**
 * Make a storage node for auxilliary data for a value on the board.
 *
 * @param {ERef<StorageNode>} chainStorage
 * @param {string} boardId
 */
const makeBoardAuxNode = async (chainStorage, boardId) => {
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  return E(boardAux).makeChildNode(boardId);
};

const marshalData = makeMarshal(_val => Fail`data only`);

/** @type {<T>(xP: Promise<T | null | undefined>) => Promise<T>} */
const the = async xP => {
  const x = await xP;
  assert(x != null, 'resolution is unexpectedly nullish');
  return x;
};

/** @import {MockChainStorageRoot as MockVStorageRoot} from '@agoric/internal/src/storage-test-utils.js' */

const IST_UNIT = 1_000_000n;
const CENT = IST_UNIT / 100n;

/**
 * @param {import('ava').ExecutionContext<
 *   Awaited<ReturnType<makeDefaultTestContext>>
 * >} t
 */
const makeScenario = t => {
  /**
   * A player and their user agent (wallet UI, signer)
   *
   * @param {string} addr
   * @param {PromiseKit<any>} bridgeKit - to announce UI is ready
   * @param {MockVStorageRoot} vsRPC - access to vstorage via RPC
   * @param {typeof t.context.sendToBridge} broadcastMsg
   * @param {any} walletUpdates - access to wallet updates via RPC
   */
  const aPlayer = async (
    addr,
    bridgeKit,
    vsRPC,
    broadcastMsg,
    walletUpdates,
  ) => {
    const ctx = makeImportContext();
    const vsGet = async path =>
      E(vsRPC).getBody(`mockChainStorageRoot.${path}`, ctx.fromBoard);

    // Ingest well-known brands, instances.
    // Wait for vstorage publication to settle first.
    await eventLoopIteration();
    /** @type {Record<string, Brand>} */
    // @ts-expect-error unsafe testing cast
    const wkBrand = Object.fromEntries(await vsGet(`agoricNames.brand`));
    await vsGet(`agoricNames.instance`);
    t.log(addr, 'wallet UI: ingest well-known brands', wkBrand.Place);

    assert(broadcastMsg);
    /** @param {import('../src/smartWallet.js').BridgeAction} action */
    const signAndBroadcast = async action => {
      const actionEncoding = ctx.fromBoard.toCapData(action);
      const addIssuerMsg = {
        type: ActionType.WALLET_SPEND_ACTION,
        owner: addr,
        spendAction: JSON.stringify(actionEncoding),
        blockTime: 0,
        blockHeight: 0,
      };
      t.log(addr, 'walletUI: broadcast signed message', action.method);
      await broadcastMsg(addIssuerMsg);
    };

    const auxInfo = async obj => {
      const slot = ctx.fromBoard.toCapData(obj).slots[0];
      return vsGet(`${BOARD_AUX}.${slot}`);
    };

    const { entries } = Object;
    const uiBridge = Far('UIBridge', {
      /** @param {import('@endo/marshal').CapData<string>} offerEncoding */
      proposeOffer: async offerEncoding => {
        const offer = /** @type {import('../src/offers.js').OfferSpec} */ (
          ctx.fromBoard.fromCapData(offerEncoding)
        );
        const { give, want } = offer.proposal;
        for await (const [kw, amt] of entries({ ...give, ...want })) {
          // @ts-expect-error
          const { displayInfo } = await auxInfo(amt.brand);
          const kind = displayInfo?.assetKind === 'nat' ? 'fungible' : 'NFT';
          t.log('wallet:', kind, 'display for', kw, amt.brand);
        }
        t.log(addr, 'walletUI: approve offer:', offer.id);
        await signAndBroadcast(harden({ method: 'executeOffer', offer }));
      },
    });
    bridgeKit.resolve(uiBridge);
    return walletUpdates;
  };

  return { aPlayer };
};

test.serial('trading in non-vbank asset: game real-estate NFTs', async t => {
  const pettyCashQty = 1000n;
  const pettyCashPK = makePromiseKit();

  const publishBrandInfo = async (chainStorage, board, brand) => {
    const [id, displayInfo] = await Promise.all([
      E(board).getId(brand),
      E(brand).getDisplayInfo(),
    ]);
    const node = makeBoardAuxNode(chainStorage, id);
    const aux = marshalData.toCapData(harden({ displayInfo }));
    await E(node).setValue(JSON.stringify(aux));
  };

  /**
   * @param {BootstrapPowers} powers
   * @param {Record<string, Bundle>} bundles
   */
  const finishBootstrap = async ({ consume }, bundles) => {
    const kindAdmin = async kind =>
      E(consume.agoricNamesAdmin).lookupAdmin(kind);

    const publishAgoricNames = async () => {
      const { board, chainStorage } = consume;
      const pubm = E(board).getPublishingMarshaller();
      const namesNode = await E(chainStorage)?.makeChildNode('agoricNames');
      assert(namesNode);
      for (const kind of ['brand', 'instance']) {
        const kindNode = await E(namesNode).makeChildNode(kind);
        const kindUpdater = Far('Updater', {
          write: async x => {
            // console.log('marshal for vstorage write', x);
            const capData = await E(pubm).toCapData(x);
            await E(kindNode).setValue(JSON.stringify(capData));
          },
        });
        await E(kindAdmin(kind)).onUpdate(kindUpdater);
      }
      t.log('bootstrap: share agoricNames updates via vstorage RPC');
    };

    const shareIST = async () => {
      const { chainStorage, bankManager, board, feeMintAccess, zoe } = consume;
      const stable = await E(zoe)
        .getFeeIssuer()
        .then(async issuer => {
          return E(issuer)
            .getBrand()
            .then(brand => ({ issuer, brand }));
        });
      await E(kindAdmin('issuer')).update('IST', stable.issuer);
      await E(kindAdmin('brand')).update('IST', stable.brand);
      // TODO: publishBrandInfo for all brands in agoricNames.brand
      await publishBrandInfo(chainStorage, board, stable.brand);

      const invitation = await E(E(zoe).getInvitationIssuer()).getBrand();
      await E(kindAdmin('brand')).update('Zoe Invitation', invitation);

      const { creatorFacet: supplier } = await E(zoe).startInstance(
        E(zoe).install(bundles.centralSupply),
        {},
        { bootstrapPaymentValue: pettyCashQty * IST_UNIT },
        { feeMintAccess: await feeMintAccess },
      );
      const bootPmt = await E(supplier).getBootstrapPayment();
      const stableSupply = E(stable.issuer).makeEmptyPurse();
      await E(stableSupply).deposit(bootPmt);
      pettyCashPK.resolve(stableSupply);

      await E(bankManager).addAsset(
        'uist',
        'IST',
        'Inter Stable Token',
        stable,
      );
    };

    await Promise.all([publishAgoricNames(), shareIST()]);
  };

  /**
   * Core eval script to start contract
   *
   * @param {BootstrapPowers} permittedPowers
   * @param {Bundle} bundle - in prod: a bundleId
   */
  const startGameContract = async ({ consume }, bundle) => {
    const { agoricNames, agoricNamesAdmin, board, chainStorage, zoe } = consume;
    const istBrand = await E(agoricNames).lookup('brand', 'IST');
    const ist = {
      brand: istBrand,
    };
    const terms = { joinPrice: AmountMath.make(ist.brand, 25n * CENT) };
    const installationP = E(zoe).install(bundle); // in prod: installBundleId
    // in prod: use startUpgradeable() to save adminFacet
    const { instance } = await E(zoe).startInstance(installationP, {}, terms);
    t.log('CoreEval script: started game contract', instance);
    const {
      brands: { Place: brand },
      issuers: { Place: issuer },
    } = await E(zoe).getTerms(instance);

    t.log('CoreEval script: share via agoricNames:', brand);
    const kindAdmin = async kind => E(agoricNamesAdmin).lookupAdmin(kind);
    await Promise.all([
      E(kindAdmin('instance')).update('game1', instance),
      E(kindAdmin('issuer')).update('Place', issuer),
      E(kindAdmin('brand')).update('Place', brand),
      publishBrandInfo(the(chainStorage), board, brand),
    ]);
  };

  /**
   * @param {MockVStorageRoot} rpc - access to vstorage (in prod: via RPC)
   * @param {any} walletBridge - iframe connection to wallet UI
   */
  const dappFrontEnd = async (rpc, walletBridge) => {
    const { fromEntries } = Object;
    const ctx = makeImportContext();
    await eventLoopIteration();
    const vsGet = async path =>
      E(rpc).getBody(`mockChainStorageRoot.${path}`, ctx.fromBoard);

    // @ts-expect-error unsafe testing cast
    const wkBrand = fromEntries(await vsGet(`agoricNames.brand`));
    // @ts-expect-error unsafe testing cast
    const wkInstance = fromEntries(await vsGet(`agoricNames.instance`));
    t.log('game UI: ingested well-known brands:', wkBrand.Place);

    const choices = ['Park Place', 'Boardwalk'];
    const want = {
      Places: AmountMath.make(
        wkBrand.Place,
        makeCopyBag(choices.map(name => [name, 1n])),
      ),
    };
    const give = { Price: AmountMath.make(wkBrand.IST, 25n * CENT) };
    /** @type {import('../src/offers.js').OfferSpec} */
    const offer1 = harden({
      id: 'joinGame1234',
      invitationSpec: {
        source: 'contract',
        instance: wkInstance.game1,
        publicInvitationMaker: 'makeJoinInvitation',
      },
      proposal: { give, want },
    });
    t.log('game UI: propose offer of 0.25IST for', choices.join(', '));
    await E(walletBridge).proposeOffer(ctx.fromBoard.toCapData(offer1));
  };

  // TODO: hoist the functions above out of the test
  // so that t.context is not in scope?
  const { consume, simpleProvideWallet, sendToBridge } = t.context;

  const bundles = {
    game: await importSpec('./gameAssetContract.js').then(async spec =>
      bundleSource(spec),
    ),
    centralSupply: await importSpec('@agoric/vats/src/centralSupply.js').then(
      async spec => bundleSource(spec),
    ),
  };

  const fundWalletAndSubscribe = async (addr, istQty) => {
    const purse = pettyCashPK.promise;
    const spendBrand = await E(purse).getAllegedBrand();
    const spendingPmt = await E(purse).withdraw(
      AmountMath.make(spendBrand, istQty * IST_UNIT),
    );
    const wallet = simpleProvideWallet(addr);
    t.log('deposit', istQty, 'IST into wallet of', addr);
    await E(E(wallet).getDepositFacet()).receive(spendingPmt);
    const updates = await E(wallet).getUpdatesSubscriber();
    return updates;
  };

  /** @type {BootstrapPowers} */
  // @ts-expect-error mock
  const somePowers = { consume };

  /** @type {MockVStorageRoot} */
  // @ts-expect-error mock
  const mockStorage = await consume.chainStorage;
  await finishBootstrap(somePowers, bundles);
  t.log(
    'install game contract bundle with hash:',
    bundles.game.endoZipBase64Sha512.slice(0, 24),
    '...',
  );

  {
    const addr1 = 'agoric1player1';
    const walletUIbridge = makePromiseKit();
    const { aPlayer } = makeScenario(t);

    const [_1, _2, updates] = await Promise.all([
      startGameContract(somePowers, bundles.game),
      dappFrontEnd(mockStorage, walletUIbridge.promise),
      aPlayer(
        addr1,
        walletUIbridge,
        mockStorage,
        sendToBridge,
        fundWalletAndSubscribe(addr1, 10n),
      ),
    ]);

    /** @type {[string, bigint][]} */
    const expected = [
      ['Park Place', 1n],
      ['Boardwalk', 1n],
    ];

    /** @type {import('../src/smartWallet.js').UpdateRecord} */
    const update = await headValue(updates);
    assert(update.updated === 'offerStatus');
    // t.log(update.status);
    t.like(update, {
      updated: 'offerStatus',
      status: {
        id: 'joinGame1234',
        invitationSpec: { publicInvitationMaker: 'makeJoinInvitation' },
        numWantsSatisfied: 1,
        payouts: { Places: { value: { payload: expected } } },
        result: 'welcome to the game',
      },
    });
    const {
      status: { id, result, payouts },
    } = update;
    const names = payouts?.Places.value.payload.map(([name, _qty]) => name);
    t.log(id, 'result:', result, ', payouts:', names.join(', '));

    // wallet balance was also updated
    const ctx = makeImportContext();
    const vsGet = (path, ix = -1) =>
      mockStorage.getBody(`mockChainStorageRoot.${path}`, ctx.fromBoard, ix);
    /** @type {Record<string, Brand>} */
    const wkb = Object.fromEntries(
      // @ts-expect-error unsafe testing cast
      vsGet(`agoricNames.brand`),
    );
    vsGet(`agoricNames.instance`);

    const balanceUpdate = vsGet(`wallet.${addr1}`, -2);
    t.deepEqual(balanceUpdate, {
      updated: 'balance',
      currentAmount: { brand: wkb.Place, value: makeCopyBag(expected) },
    });
  }
});

test.serial('non-vbank asset: give before deposit', async t => {
  /**
   * Goofy client: proposes to give Places before we have any
   *
   * @param {MockVStorageRoot} rpc - access to vstorage (in prod: via RPC)
   * @param {any} walletBridge - iframe connection to wallet UI
   */
  const goofyClient = async (rpc, walletBridge) => {
    const { fromEntries } = Object;
    const ctx = makeImportContext();
    const vsGet = async path =>
      E(rpc).getBody(`mockChainStorageRoot.${path}`, ctx.fromBoard);
    // @ts-expect-error unsafe testing cast
    const wkBrand = fromEntries(await vsGet(`agoricNames.brand`));
    // @ts-expect-error unsafe testing cast
    const wkInstance = fromEntries(await vsGet(`agoricNames.instance`));

    const choices = ['Disney Land'];
    const give = {
      Places: AmountMath.make(
        wkBrand.Place,
        makeCopyBag(choices.map(name => [name, 1n])),
      ),
    };
    const want = { Price: AmountMath.make(wkBrand.IST, 25n * CENT) };

    /** @type {import('../src/offers.js').OfferSpec} */
    const offer1 = harden({
      id: 'joinGame2345',
      invitationSpec: {
        source: 'contract',
        instance: wkInstance.game1,
        publicInvitationMaker: 'makeJoinInvitation',
      },
      proposal: { give, want },
    });
    t.log('goofy client: propose to give', choices.join(', '));
    await E(walletBridge).proposeOffer(ctx.fromBoard.toCapData(offer1));
  };

  {
    const addr2 = 'agoric1player2';
    const walletUIbridge = makePromiseKit();
    // await eventLoopIteration();

    const { simpleProvideWallet, consume, sendToBridge } = t.context;
    const wallet = simpleProvideWallet(addr2);
    const updates = await E(wallet).getUpdatesSubscriber();
    /** @type {MockVStorageRoot} */
    // @ts-expect-error mock
    const mockStorage = await consume.chainStorage;
    const { aPlayer } = makeScenario(t);

    await aPlayer(addr2, walletUIbridge, mockStorage, sendToBridge, updates);
    const c2 = goofyClient(mockStorage, walletUIbridge.promise);
    await t.throwsAsync(c2, { message: /Withdrawal of {.*} failed/ });
    await eventLoopIteration();

    // wallet balance was also updated
    const ctx = makeImportContext();
    const vsGet = (path, ix = -1) =>
      mockStorage.getBody(`mockChainStorageRoot.${path}`, ctx.fromBoard, ix);
    vsGet(`agoricNames.brand`);
    vsGet(`agoricNames.instance`);

    /**
     * @type {import('../src/smartWallet.js').UpdateRecord & {
     *   updated: 'offerStatus';
     * }}
     */
    let offerUpdate;
    let ix = -1;
    for (;;) {
      /** @type {import('../src/smartWallet.js').UpdateRecord} */
      // @ts-expect-error
      const update = vsGet(`wallet.${addr2}`, ix);
      if (update.updated === 'offerStatus') {
        offerUpdate = update;
        break;
      }
      ix -= 1;
    }

    t.regex(offerUpdate.status.error || '', /Withdrawal of {.*} failed/);
    t.log(offerUpdate.status.id, offerUpdate.status.error);
  }
});
