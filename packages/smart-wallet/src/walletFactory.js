/**
 * @file Wallet Factory
 *
 *   Contract to make smart wallets.
 *
 *   Note: The upgrade test uses a slightly modified copy of this file. When the
 *   interface changes here, that will also need to change.
 */

import { makeTracer, WalletName } from '@agoric/internal';
import { observeIteration, subscribeEach } from '@agoric/notifier';
import { M, makeExo, makeScalarMapStore, mustMatch } from '@agoric/store';
import { makeAtomicProvider } from '@agoric/store/src/stores/store-utils.js';
import { prepareExo, provideDurableMapStore } from '@agoric/vat-data';
import { provideAll } from '@agoric/zoe/src/contractSupport/durability.js';
import { E } from '@endo/far';
import { prepareSmartWallet } from './smartWallet.js';
import { shape } from './typeGuards.js';

/** @import {NameHub} from '@agoric/vats'; */

const trace = makeTracer('WltFct');

export const customTermsShape = harden({
  agoricNames: M.eref(M.remotable('agoricNames')),
  board: M.eref(M.remotable('board')),
  assetPublisher: M.eref(M.remotable('Bank')),
});

export const privateArgsShape = harden(
  M.splitRecord(
    { storageNode: M.eref(M.remotable('StorageNode')) },
    { walletBridgeManager: M.eref(M.remotable('walletBridgeManager')) },
  ),
);

const WALLETS_BY_ADDRESS = 'walletsByAddress';

/**
 * Provide a NameHub for this address and insert depositFacet only if not
 * already done.
 *
 * @param {string} address
 * @param {import('./smartWallet.js').SmartWallet} wallet
 * @param {ERef<import('@agoric/vats').NameAdmin>} namesByAddressAdmin
 */
export const publishDepositFacet = async (
  address,
  wallet,
  namesByAddressAdmin,
) => {
  const { nameAdmin: myAddressNameAdmin } = await E(
    namesByAddressAdmin,
  ).provideChild(address, [WalletName.depositFacet]);

  return E(myAddressNameAdmin).default(
    WalletName.depositFacet,
    wallet.getDepositFacet(),
  );
};

/**
 * Make a registry for use by the wallet instances.
 *
 * This doesn't need to persist durably because the `assetPublisher` has a
 * "pinned" topic and call to getAssetSubscription gets a fresh stream of all
 * the assets that it knows of.
 *
 * @param {AssetPublisher} assetPublisher
 */
export const makeAssetRegistry = assetPublisher => {
  trace('makeAssetRegistry', assetPublisher);
  /**
   * @typedef {{
   *   brand: Brand;
   *   displayInfo: DisplayInfo;
   *   issuer: Issuer;
   *   petname: import('./types.js').Petname;
   * }} BrandDescriptor
   *   For use by clients to describe brands to users. Includes `displayInfo` to
   *   save a remote call.
   */
  /** @type {MapStore<Brand, BrandDescriptor>} */
  const brandDescriptors = makeScalarMapStore();

  // Watch the bank for issuers to keep on hand for making purses.
  void observeIteration(
    subscribeEach(E(assetPublisher).getAssetSubscription()),
    {
      async updateState(desc) {
        trace('registering asset', desc.issuerName);
        const { brand, issuer: issuerP, issuerName: petname } = desc;
        // await issuer identity for use in chainStorage
        const [issuer, displayInfo] = await Promise.all([
          issuerP,
          E(brand).getDisplayInfo(),
        ]);

        brandDescriptors.init(desc.brand, {
          brand,
          issuer,
          petname,
          displayInfo,
        });
      },
    },
  );

  const registry = {
    /** @param {Brand} brand */
    has: brand => brandDescriptors.has(brand),
    /** @param {Brand} brand */
    get: brand => brandDescriptors.get(brand),
    values: () => brandDescriptors.values(),
  };
  return registry;
};

/**
 * @typedef {{
 *   agoricNames: ERef<NameHub>;
 *   board: ERef<import('@agoric/vats').Board>;
 *   assetPublisher: AssetPublisher;
 * }} SmartWalletContractTerms
 *
 *
 * @typedef {{
 *   getAssetSubscription: () => ERef<
 *     IterableEachTopic<import('@agoric/vats/src/vat-bank.js').AssetDescriptor>
 *   >;
 * }} AssetPublisher
 *
 *
 * @typedef {boolean} IsRevive
 *
 * @typedef {{
 *   reviveWallet: (
 *     address: string,
 *   ) => Promise<import('./smartWallet.js').SmartWallet>;
 *   ackWallet: (address: string) => IsRevive;
 * }} WalletReviver
 */

// NB: even though all the wallets share this contract,
// 1. they should not rely on that; they may be partitioned later
// 2. they should never be able to detect behaviors from another wallet
/**
 * @param {ZCF<SmartWalletContractTerms>} zcf
 * @param {{
 *   storageNode: ERef<StorageNode>;
 *   walletBridgeManager?: ERef<
 *     import('@agoric/vats').ScopedBridgeManager<'wallet'>
 *   >;
 *   walletReviver?: ERef<WalletReviver>;
 * }} privateArgs
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const prepare = async (zcf, privateArgs, baggage) => {
  const upgrading = baggage.has(WALLETS_BY_ADDRESS);
  const { agoricNames, board, assetPublisher } = zcf.getTerms();

  const zoe = zcf.getZoeService();
  const { storageNode, walletBridgeManager, walletReviver } = privateArgs;

  /** @type {MapStore<string, import('./smartWallet.js').SmartWallet>} */
  const walletsByAddress = provideDurableMapStore(baggage, WALLETS_BY_ADDRESS);
  const provider = makeAtomicProvider(walletsByAddress);

  const handleWalletAction = makeExo(
    'walletActionHandler',
    M.interface('walletActionHandlerI', {
      fromBridge: M.call(shape.WalletBridgeMsg).returns(M.promise()),
    }),
    {
      /**
       * Designed to be called by the bridgeManager vat.
       *
       * If this errors before calling handleBridgeAction(), the failure will
       * not be observable. The promise does reject, but as of now bridge
       * manager drops instead of handling it. Eventually we'll make the bridge
       * able to give feedback about the requesting transaction. Meanwhile we
       * could write the error to chainStorage but we don't have a guarantee of
       * the wallet owner to associate it with. (We could have a shared
       * `lastError` node but it would be so noisy as to not provide much info
       * to the end user.)
       *
       * Once the owner is known, this calls handleBridgeAction which ensures
       * that all errors are published in the owner wallet's vstorage path.
       *
       * @param {import('./types.js').WalletBridgeMsg} obj validated by
       *   shape.WalletBridgeMsg
       * @returns {Promise<void>}
       */
      fromBridge: async obj => {
        console.log('walletFactory.fromBridge:', obj);

        const canSpend = 'spendAction' in obj;

        // xxx capData body is also a JSON string so this is double-encoded
        // revisit after https://github.com/Agoric/agoric-sdk/issues/2589
        const actionCapData = JSON.parse(
          canSpend ? obj.spendAction : obj.action,
        );
        mustMatch(harden(actionCapData), shape.StringCapData);

        // Revive an old wallet if necessary, but otherwise
        // insist that it is already in the store.
        const address = obj.owner;
        const walletP =
          !walletsByAddress.has(address) && walletReviver
            ? // this will call provideSmartWallet which will update `walletsByAddress` for next time
              E(walletReviver).reviveWallet(address)
            : walletsByAddress.get(address); // or throw
        const wallet = await walletP;

        console.log('walletFactory:', { wallet, actionCapData });
        return E(wallet).handleBridgeAction(actionCapData, canSpend);
      },
    },
  );

  // Zoe is an inter-vat call and thus cannot be made during upgrade. So ensure that
  // the first incarnation saves them and subsequent ones read from baggage.
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const {
    invitationIssuer,
    invitationBrand,
    invitationDisplayInfo,
    publicMarshaller,
  } = await provideAll(baggage, {
    invitationIssuer: async () => invitationIssuerP,
    invitationBrand: async () => E(invitationIssuerP).getBrand(),
    invitationDisplayInfo: async () =>
      E(E(invitationIssuerP).getBrand()).getDisplayInfo(),
    publicMarshaller: async () => E(board).getReadonlyMarshaller(),
  });

  const registry = makeAssetRegistry(assetPublisher);

  const shared = harden({
    agoricNames,
    invitationBrand,
    invitationDisplayInfo,
    invitationIssuer,
    publicMarshaller,
    registry,
    zoe,
  });

  /**
   * Holders of this object:
   *
   * - vat (transitively from holding the wallet factory)
   * - wallet-ui (which has key material; dapps use wallet-ui to propose actions)
   */
  const makeSmartWallet = prepareSmartWallet(baggage, shared);

  const creatorFacet = prepareExo(
    baggage,
    'walletFactoryCreator',
    M.interface('walletFactoryCreatorI', {
      provideSmartWallet: M.callWhen(
        M.string(),
        M.await(M.remotable('Bank')),
        M.await(M.remotable('namesByAddressAdmin')),
      ).returns([M.remotable('SmartWallet'), M.boolean()]),
    }),
    {
      /**
       * @param {string} address
       * @param {ERef<import('@agoric/vats/src/vat-bank.js').Bank>} bank
       * @param {ERef<import('@agoric/vats/src/types.js').NameAdmin>} namesByAddressAdmin
       * @returns {Promise<
       *   [wallet: import('./smartWallet.js').SmartWallet, isNew: boolean]
       * >}
       *   wallet along with a flag to distinguish between looking up an existing
       *   wallet and creating a new one.
       */
      provideSmartWallet(address, bank, namesByAddressAdmin) {
        let isNew = false;

        /**
         * @type {(
         *   address: string,
         * ) => Promise<import('./smartWallet.js').SmartWallet>}
         */
        const maker = async _address => {
          const invitationPurse = await E(invitationIssuer).makeEmptyPurse();
          const walletStorageNode = E(storageNode).makeChildNode(address);
          const wallet = await makeSmartWallet(
            harden({ address, walletStorageNode, bank, invitationPurse }),
          );

          // An await here would deadlock with invitePSMCommitteeMembers
          void publishDepositFacet(address, wallet, namesByAddressAdmin);

          isNew = true;
          return wallet;
        };

        const finisher = walletReviver
          ? async (_address, _wallet) => {
              const isRevive = await E(walletReviver).ackWallet(address);
              isNew = !isRevive;
            }
          : undefined;

        return provider
          .provideAsync(address, maker, finisher)
          .then(w => [w, isNew]);
      },
    },
  );

  // NOTE: both `MsgWalletAction` and `MsgWalletSpendAction` arrive as BRIDGE_ID.WALLET
  // by way of performAction() in cosmic-swingset/src/launch-chain.js
  if (walletBridgeManager) {
    // NB: may not be in service when creatorFacet is used, or ever
    // It can't be awaited because that fails vat restart
    if (upgrading) {
      void E(walletBridgeManager).setHandler(handleWalletAction);
    } else {
      void E(walletBridgeManager).initHandler(handleWalletAction);
    }
  }

  return {
    creatorFacet,
  };
};
harden(prepare);

// So we can consistently import `start` from contracts.
// Can't be a value export because Zoe enforces that contracts export one or the other.
/** @typedef {typeof prepare} start */
