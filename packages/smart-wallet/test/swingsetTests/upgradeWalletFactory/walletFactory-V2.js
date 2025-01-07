/**
 * @file fixture for an upgrade of the primary walletFactory contract,
 *   packages/smart-wallet/src/walletFactory.js
 *
 *   This variant adds a sayHelloUpgrade method to check that upgrade has
 *   occurred.
 */

import { M, makeExo, mustMatch } from '@agoric/store';
import { makeAtomicProvider } from '@agoric/store/src/stores/store-utils.js';
import { prepareExo, provideDurableMapStore } from '@agoric/vat-data';
import { provideAll } from '@agoric/zoe/src/contractSupport/durability.js';
import { E } from '@endo/far';
import { prepareSmartWallet } from '../../../src/smartWallet.js';
import { shape } from '../../../src/typeGuards.js';
import {
  makeAssetRegistry,
  publishDepositFacet,
} from '../../../src/walletFactory.js';

/**
 * @type {typeof import('../../../src/walletFactory.js').prepare}
 */
export const prepare = async (zcf, privateArgs, baggage) => {
  // copy paste from original contract, with type imports fixed and sayHelloUpgrade method added to creatorFacet)
  const { agoricNames, board, assetPublisher } = zcf.getTerms();

  const zoe = zcf.getZoeService();
  const { storageNode, walletBridgeManager } = privateArgs;

  /**
   * @type {MapStore<
   *   string,
   *   import('../../../src/smartWallet.js').SmartWallet
   * >}
   */
  const walletsByAddress = provideDurableMapStore(baggage, 'walletsByAddress');
  const provider = makeAtomicProvider(walletsByAddress);

  const handleWalletAction = makeExo(
    'walletActionHandler',
    M.interface('walletActionHandlerI', {
      fromBridge: M.call(shape.WalletBridgeMsg).returns(M.promise()),
    }),
    {
      /**
       * @param {import('../../../src/types.js').WalletBridgeMsg} obj validated
       *   by shape.WalletBridgeMsg
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

        const wallet = walletsByAddress.get(obj.owner); // or throw

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
      // new for V2
      sayHelloUpgrade: M.call().returns(M.string()),
    }),
    {
      /**
       * @param {string} address
       * @param {ERef<import('@agoric/vats/src/vat-bank.js').Bank>} bank
       * @param {ERef<import('@agoric/vats/src/types.js').NameAdmin>} namesByAddressAdmin
       * @returns {Promise<
       *   [import('../../../src/smartWallet.js').SmartWallet, boolean]
       * >}
       *   wallet along with a flag to distinguish between looking up an existing
       *   wallet and creating a new one.
       */
      provideSmartWallet(address, bank, namesByAddressAdmin) {
        let makerCalled = false;
        /**
         * @type {() => Promise<
         *   import('../../../src/smartWallet.js').SmartWallet
         * >}
         */
        const maker = async () => {
          const invitationPurse = await E(invitationIssuer).makeEmptyPurse();
          const walletStorageNode = E(storageNode).makeChildNode(address);
          const wallet = await makeSmartWallet(
            harden({ address, walletStorageNode, bank, invitationPurse }),
          );

          // An await here would deadlock with invitePSMCommitteeMembers
          void publishDepositFacet(address, wallet, namesByAddressAdmin);

          makerCalled = true;
          return wallet;
        };

        return provider
          .provideAsync(address, maker)
          .then(w => [w, makerCalled]);
      },
      // new for V2
      sayHelloUpgrade: () => 'hello, upgrade',
    },
  );

  // NOTE: both `MsgWalletAction` and `MsgWalletSpendAction` arrive as BRIDGE_ID.WALLET
  // by way of performAction() in cosmic-swingset/src/launch-chain.js
  await (walletBridgeManager &&
    E(walletBridgeManager).initHandler(handleWalletAction));

  return {
    creatorFacet,
  };
};
