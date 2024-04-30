import { AmountMath, AssetKind, BrandShape } from '@agoric/ertp';
import { deeplyFulfilledObject } from '@agoric/internal';
import { prepareGuardedAttenuator } from '@agoric/internal/src/callback.js';
import {
  IterableEachTopicI,
  makeNotifierKit,
  makePublishKit as makeHeapPublishKit,
  prepareDurablePublishKit,
  subscribeEach,
} from '@agoric/notifier';
import { M, getInterfaceGuardPayload } from '@endo/patterns';
import { provideLazy } from '@agoric/store';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { E, Far } from '@endo/far';
import { makeAtomicProvider } from '@agoric/store/src/stores/store-utils.js';
import { BridgeHandlerI, BridgeScopedManagerI } from './bridge.js';
import {
  makeVirtualPurseKitIKit,
  prepareVirtualPurse,
} from './virtual-purse.js';

const { Fail } = assert;

const { VirtualPurseControllerI } = makeVirtualPurseKitIKit();

const BridgeChannelI = M.interface('BridgeChannel', {
  fromBridge:
    getInterfaceGuardPayload(BridgeScopedManagerI).methodGuards.fromBridge,
  toBridge:
    getInterfaceGuardPayload(BridgeScopedManagerI).methodGuards.toBridge,
});

/**
 * @typedef {Awaited<ReturnType<ReturnType<typeof prepareVirtualPurse>>>} VirtualPurse
 * @import {VirtualPurseController} from './virtual-purse.js'
 */

/**
 * @typedef {object} BalanceUpdater
 * @property {(value: string, nonce?: string) => void} update
 */

const BalanceUpdaterI = M.interface('BalanceUpdater', {
  update: M.call(M.string()).optional(M.string()).returns(),
});

/**
 * @typedef {Pick<
 *   import('./types.js').ScopedBridgeManager,
 *   'fromBridge' | 'toBridge'
 * >} BridgeChannel
 */

/**
 * @param {import('@agoric/zone').Zone} zone
 * @returns {(brand: Brand, publisher: Publisher<Amount>) => BalanceUpdater}
 */
const prepareBalanceUpdater = zone =>
  zone.exoClass(
    'BalanceUpdater',
    BalanceUpdaterI,
    (brand, publisher) => ({
      brand,
      publisher,
      lastBalanceUpdate: -1n,
    }),
    {
      update(value, nonce = undefined) {
        if (nonce !== undefined) {
          const thisBalanceUpdate = BigInt(nonce);
          if (thisBalanceUpdate <= this.state.lastBalanceUpdate) {
            return;
          }
          this.state.lastBalanceUpdate = thisBalanceUpdate;
        }
        // Convert the string value to a bigint.
        const amt = AmountMath.make(this.state.brand, BigInt(value));
        this.state.publisher.publish(amt);
      },
    },
  );

/** @param {import('@agoric/zone').Zone} zone */
const prepareBankPurseController = zone => {
  /**
   * @param {BridgeChannel} bankBridge
   * @param {string} denom
   * @param {Brand} brand
   * @param {string} address
   * @param {PublishKit<Amount>} balanceKit
   * @returns {VirtualPurseController}
   */
  const makeBankPurseController = zone.exoClass(
    'BankPurseController',
    VirtualPurseControllerI,
    /**
     * @param {BridgeChannel} bankBridge
     * @param {string} denom
     * @param {Brand} brand
     * @param {string} address
     * @param {LatestTopic<Amount>} balanceTopic
     */
    (bankBridge, denom, brand, address, balanceTopic) => ({
      bankBridge,
      denom,
      brand,
      address,
      balanceTopic,
    }),
    {
      getBalances(b) {
        const { brand, balanceTopic } = this.state;
        assert.equal(b, brand);
        return balanceTopic;
      },
      async pushAmount(amt) {
        const { bankBridge, denom, address, brand } = this.state;
        const value = AmountMath.getValue(brand, amt);
        const update = await bankBridge.toBridge({
          type: 'VBANK_GIVE',
          recipient: address,
          denom,
          amount: `${value}`,
        });
        await bankBridge.fromBridge(update);
      },
      async pullAmount(amt) {
        const { bankBridge, denom, address, brand } = this.state;
        const value = AmountMath.getValue(brand, amt);
        const update = await bankBridge.toBridge({
          type: 'VBANK_GRAB',
          sender: address,
          denom,
          amount: `${value}`,
        });
        await bankBridge.fromBridge(update);
      },
    },
  );
  return makeBankPurseController;
};

/** @param {import('@agoric/zone').Zone} zone */
const prepareRewardPurseController = zone =>
  zone.exoClass(
    'RewardPurseController',
    VirtualPurseControllerI,
    /**
     * @param {BridgeChannel} bankChannel
     * @param {string} denom
     * @param {Brand} brand
     */
    (bankChannel, denom, brand) => ({ bankChannel, denom, brand }),
    {
      getBalances(b) {
        // Never resolve!
        assert.equal(b, this.state.brand);
        return makeNotifierKit().notifier;
      },
      async pullAmount(_amount) {
        throw Error(`Cannot pull from reward distributor`);
      },
      async pushAmount(amount) {
        const { brand, bankChannel, denom } = this.state;
        const value = AmountMath.getValue(brand, amount);
        await bankChannel.toBridge({
          type: 'VBANK_GIVE_TO_REWARD_DISTRIBUTOR',
          denom,
          amount: `${value}`,
        });
      },
    },
  );

/** @param {import('@agoric/zone').Zone} zone */
const prepareBankChannelHandler = zone =>
  zone.exoClass(
    'BankChannelHandler',
    BridgeHandlerI,
    /** @param {MapStore<string, MapStore<string, BalanceUpdater>>} denomToAddressUpdater */
    denomToAddressUpdater => ({ denomToAddressUpdater }),
    {
      async fromBridge(obj) {
        switch (obj && obj.type) {
          case 'VBANK_BALANCE_UPDATE': {
            const { denomToAddressUpdater } = this.state;
            for (const update of obj.updated) {
              const { address, denom, amount: value, nonce } = update;
              /** @type {BalanceUpdater | undefined} */
              let updater;
              try {
                const addressToUpdater = denomToAddressUpdater.get(denom);
                if (addressToUpdater.has(address)) {
                  updater = addressToUpdater.get(address);
                }
                // console.info('bank balance update', update);
              } catch (e) {
                console.error('Unregistered denom in', update, e);
              }
              if (updater) {
                try {
                  updater.update(value, nonce);
                } catch (e) {
                  console.error('Error updating balance', update, e);
                }
              }
            }
            break;
          }
          default: {
            Fail`Unrecognized request ${obj}`;
          }
        }
      },
    },
  );

/**
 * Concatenate multiple iterables to form a new one.
 *
 * @template T
 * @param {(Iterable<T> | AsyncIterable<T>)[]} iterables
 */
async function* concatAsyncIterables(iterables) {
  for (const asyncIterable of iterables) {
    yield* asyncIterable;
  }
}
harden(concatAsyncIterables);

/**
 * TODO: This should be absorbed and zone-ified into the existing publish kit.
 *
 * @template T
 * @param {AsyncIterable<T>} asyncIterable
 * @param {(value: T, prior?: T) => unknown} skipValue
 */
const makeSubscriberFromAsyncIterable = (
  asyncIterable,
  skipValue = (_value, _prior) => false,
) => {
  const { subscriber, publisher } = makeHeapPublishKit();
  void (async () => {
    /** @type {T | undefined} */
    let prior;
    // TODO: Opportunity to make this more efficient by not consuming the whole
    // iterable hotly.
    for await (const value of asyncIterable) {
      if (skipValue(value, prior)) {
        continue;
      }
      publisher.publish(value);
      prior = value;
    }
  })();
  return Far('HeapSubscriber', {
    ...subscriber,
    ...subscribeEach(subscriber),
  });
};

/**
 * @template T
 * @param {Iterable<T>} historyValues
 * @param {EachTopic<T>} futureSubscriber
 * @param {(value: T, prior?: T) => unknown} skipValue
 */
const makeHistoricalTopic = (historyValues, futureSubscriber, skipValue) => {
  // Take a synchronous snapshot of the future starting now.
  const futureIterable = subscribeEach(futureSubscriber);
  const allHistory = concatAsyncIterables([historyValues, futureIterable]);
  return makeSubscriberFromAsyncIterable(allHistory, skipValue);
};

/**
 * @type {WeakMap<
 *   MapStore<Brand, AssetDescriptor>,
 *   Promise<PublicationRecord<AssetDescriptor>>
 * >}
 */
const fullAssetPubLists = new WeakMap();

/** @param {import('@agoric/zone').Zone} zone */
const prepareAssetSubscription = zone => {
  const assetSubscriptionCache = zone.weakMapStore('assetSubscriptionCache');

  /**
   * Build an exo asset subscription that resumes from its durable components.
   *
   * @param {MapStore<Brand, AssetDescriptor>} brandToAssetDescriptor
   * @param {EachTopic<AssetDescriptor>} assetSubscriber
   * @returns {IterableEachTopic<AssetDescriptor>}
   */
  const makeAssetSubscription = zone.exoClass(
    'AssetSubscription',
    IterableEachTopicI,
    (brandToAssetDescriptor, assetSubscriber) => ({
      brandToAssetDescriptor,
      assetSubscriber,
    }),
    {
      subscribeAfter(publishCount = -1n) {
        const { brandToAssetDescriptor, assetSubscriber } = this.state;
        if (publishCount !== -1n) {
          return assetSubscriber.subscribeAfter(publishCount);
        }

        let pubList = fullAssetPubLists.get(brandToAssetDescriptor);
        if (!pubList) {
          const already = new Set();
          const fullTopic = makeHistoricalTopic(
            brandToAssetDescriptor.values(),
            assetSubscriber,
            ({ denom }) => {
              const found = already.has(denom);
              already.add(denom);
              return found;
            },
          );
          // Synchronously capture the first pubList entry before the
          // assetSubscriber has a chance to publish more.
          pubList = fullTopic.subscribeAfter();
          fullAssetPubLists.set(brandToAssetDescriptor, pubList);
        }

        return pubList;
      },
      [Symbol.asyncIterator]() {
        return subscribeEach(this.self)[Symbol.asyncIterator]();
      },
    },
  );

  /** @type {typeof makeAssetSubscription} */
  const provideAssetSubscription = (
    brandToAssetDescriptor,
    assetSubscriber,
  ) => {
    return provideLazy(assetSubscriptionCache, brandToAssetDescriptor, () =>
      makeAssetSubscription(brandToAssetDescriptor, assetSubscriber),
    );
  };
  return provideAssetSubscription;
};

/**
 * @template {AssetKind} [K=AssetKind]
 * @typedef {object} AssetIssuerKit
 * @property {ERef<Mint<K>>} [mint]
 * @property {ERef<Issuer<K>>} issuer
 * @property {Brand<K>} brand
 */

const BaseIssuerKitShape = harden({
  issuer: M.remotable('Issuer'),
  brand: BrandShape,
});

const AssetIssuerKitShape = M.splitRecord(BaseIssuerKitShape, {
  mint: M.remotable('Mint'),
});

/** @typedef {AssetIssuerKit & { denom: string; escrowPurse?: ERef<Purse> }} AssetRecord */

/**
 * @typedef {object} AssetDescriptor
 * @property {Brand} brand
 * @property {ERef<Issuer>} issuer
 * @property {string} issuerName
 * @property {string} denom
 * @property {string} proposedName
 */

/**
 * @typedef {AssetDescriptor & {
 *   issuer: Issuer<'nat'>; // settled identity
 *   displayInfo: DisplayInfo;
 * }} AssetInfo
 */

/**
 * @typedef {object} Bank
 * @property {() => IterableEachTopic<AssetDescriptor>} getAssetSubscription
 *   Returns assets as they are added to the bank
 * @property {(brand: Brand) => Promise<VirtualPurse>} getPurse Find any
 *   existing vpurse (keyed by address and brand) or create a new one.
 */

export const BankI = M.interface('Bank', {
  getAssetSubscription: M.call().returns(M.remotable('AssetSubscription')),
  getPurse: M.callWhen(BrandShape).returns(M.remotable('VirtualPurse')),
});

/**
 * @param {import('@agoric/zone').Zone} zone
 * @param {object} makers
 * @param {ReturnType<prepareAssetSubscription>} makers.provideAssetSubscription
 * @param {ReturnType<prepareDurablePublishKit>} makers.makePublishKit
 * @param {ReturnType<prepareVirtualPurse>} makers.makeVirtualPurse
 */
const prepareBank = (
  zone,
  { provideAssetSubscription, makePublishKit, makeVirtualPurse },
) => {
  const makeBalanceUpdater = prepareBalanceUpdater(zone);
  const makeBankPurseController = prepareBankPurseController(zone);

  // Using a `purseProvider` singleton requires a single map with composite keys
  // (which we emulate, since we know both address and denom are JSONable).  If
  // we decide to partition the provider and use `brandToVPurse` directly, we'd
  // need ephemera for each `makeBank` call.
  const addressDenomToPurse = zone.mapStore('addressDenomToPurse');
  /**
   * @type {import('@agoric/store/src/stores/store-utils.js').AtomicProvider<
   *     string,
   *     VirtualPurse
   *   >}
   */
  const purseProvider = makeAtomicProvider(addressDenomToPurse);

  const makeBank = zone.exoClass(
    'Bank',
    BankI,
    /**
     * @param {object} param0
     * @param {string} param0.address
     * @param {EachTopic<AssetDescriptor>} param0.assetSubscriber
     * @param {MapStore<Brand, AssetDescriptor>} param0.brandToAssetDescriptor
     * @param {BridgeChannel} [param0.bankChannel]
     * @param {MapStore<Brand, AssetRecord>} param0.brandToAssetRecord
     * @param {MapStore<Brand, VirtualPurse>} param0.brandToVPurse
     * @param {MapStore<string, MapStore<string, BalanceUpdater>>} param0.denomToAddressUpdater
     */
    ({
      address,
      assetSubscriber,
      brandToAssetDescriptor,
      bankChannel,
      brandToAssetRecord,
      brandToVPurse,
      denomToAddressUpdater,
    }) => {
      return {
        address,
        assetSubscriber,
        brandToAssetDescriptor,
        bankChannel,
        brandToAssetRecord,
        brandToVPurse,
        denomToAddressUpdater,
      };
    },
    {
      getAssetSubscription() {
        return provideAssetSubscription(
          this.state.brandToAssetDescriptor,
          this.state.assetSubscriber,
        );
      },
      /** @param {Brand} brand */
      async getPurse(brand) {
        const {
          bankChannel,
          address,
          brandToVPurse,
          brandToAssetRecord,
          denomToAddressUpdater,
        } = this.state;
        if (brandToVPurse.has(brand)) {
          return brandToVPurse.get(brand);
        }

        const assetRecord = brandToAssetRecord.get(brand);
        // Create a composite key that doesn't rely on the contents of the
        // address and denom, only that they are strings.
        const providerKey = JSON.stringify([address, assetRecord.denom]);

        /** @type {() => Promise<VirtualPurse>} */
        const makePurse = async () => {
          if (!bankChannel) {
            // Just emulate with a real purse.
            return E(assetRecord.issuer).makeEmptyPurse();
          }
          const addressToUpdater = denomToAddressUpdater.get(assetRecord.denom);

          /** @type {PublishKit<Amount>} */
          const { publisher, subscriber } = makePublishKit();
          const balanceUpdater = makeBalanceUpdater(brand, publisher);
          addressToUpdater.init(address, balanceUpdater);
          // Get the initial balance.
          const balanceString = await bankChannel.toBridge({
            type: 'VBANK_GET_BALANCE',
            address,
            denom: assetRecord.denom,
          });
          balanceUpdater.update(balanceString);

          // Create and return the virtual purse.
          const vpc = makeBankPurseController(
            bankChannel,
            assetRecord.denom,
            brand,
            address,
            subscriber,
          );
          return makeVirtualPurse(vpc, assetRecord);
        };

        return purseProvider.provideAsync(
          providerKey,
          makePurse,
          async (_key, purse) => {
            // Move it from the provider to this Exo's storage
            brandToVPurse.init(brand, purse);
            addressDenomToPurse.delete(providerKey);
          },
        );
      },
    },
  );
  return makeBank;
};

const BankManagerI = M.interface('BankManager', {
  addAsset: M.callWhen(
    M.string(),
    M.string(),
    M.string(),
    M.splitRecord(BaseIssuerKitShape, {
      mint: M.remotable('Mint'),
      payment: M.remotable('Payment'),
    }),
  ).returns(),
  getAssetSubscription: M.call().returns(M.remotable('AssetSubscription')),
  getBankForAddress: M.callWhen(M.string()).returns(M.remotable('Bank')),
  getModuleAccountAddress: M.callWhen(M.string()).returns(
    M.or(M.null(), M.string()),
  ),
  getRewardDistributorDepositFacet: M.callWhen(
    M.string(),
    AssetIssuerKitShape,
  ).returns(M.remotable('DepositFacet')),
});

/**
 * @param {import('@agoric/zone').Zone} zone
 * @param {object} makers
 * @param {ReturnType<prepareAssetSubscription>} makers.provideAssetSubscription
 * @param {ReturnType<prepareBank>} makers.makeBank
 * @param {ReturnType<prepareDurablePublishKit>} makers.makePublishKit
 * @param {ReturnType<prepareRewardPurseController>} makers.makeRewardPurseController
 * @param {ReturnType<prepareVirtualPurse>} makers.makeVirtualPurse
 */
const prepareBankManager = (
  zone,
  {
    provideAssetSubscription,
    makeBank,
    makePublishKit,
    makeRewardPurseController,
    makeVirtualPurse,
  },
) => {
  const detachedZone = zone.detached();

  const makeBankManager = zone.exoClass(
    'BankManager',
    BankManagerI,
    /**
     * @param {object} args
     * @param {BridgeChannel} [args.bankChannel]
     * @param {MapStore<string, MapStore<string, BalanceUpdater>>} args.denomToAddressUpdater
     * @param {Pick<import('./types.js').NameHubKit['nameAdmin'], 'update'>} [args.nameAdmin]
     */
    ({ bankChannel, denomToAddressUpdater, nameAdmin }) => {
      /** @type {MapStore<Brand, AssetRecord>} */
      const brandToAssetRecord = detachedZone.mapStore('brandToAssetRecord');
      /** @type {MapStore<Brand, AssetDescriptor>} */
      const brandToAssetDescriptor = detachedZone.mapStore(
        'brandToAssetDescriptor',
      );
      /**
       * @type {MapStore<
       *   string,
       *   { bank: Bank; brandToVPurse: MapStore<Brand, VirtualPurse> }
       * >}
       */
      const addressToBank = detachedZone.mapStore('addressToBank');

      /**
       * CAVEAT: The history for the assetSubscriber needs to be loaded into the
       * heap on first use in this incarnation. Use provideAssetSubscription to
       * set that up.
       *
       * @type {PublishKit<AssetDescriptor>}
       */
      const { subscriber: assetSubscriber, publisher: assetPublisher } =
        makePublishKit();

      return {
        addressToBank,
        assetSubscriber,
        assetPublisher,
        bankChannel,
        brandToAssetDescriptor,
        brandToAssetRecord,
        denomToAddressUpdater,
        nameAdmin,
      };
    },
    {
      /**
       * Returns assets as they are added to the bank.
       *
       * @returns {IterableEachTopic<AssetDescriptor>}
       */
      getAssetSubscription() {
        const { brandToAssetDescriptor, assetSubscriber } = this.state;
        return provideAssetSubscription(
          brandToAssetDescriptor,
          assetSubscriber,
        );
      },
      /**
       * @param {string} denom
       * @param {AssetIssuerKit} feeKit
       * @returns {ERef<
       *   import('@endo/far').EOnly<
       *     import('@agoric/ertp/exported.js').DepositFacet
       *   >
       * >}
       */
      getRewardDistributorDepositFacet(denom, feeKit) {
        const { bankChannel } = this.state;
        if (!bankChannel) {
          throw Error(`Bank doesn't implement reward collectors`);
        }

        const feeVpc = makeRewardPurseController(
          bankChannel,
          denom,
          feeKit.brand,
        );

        const vp = makeVirtualPurse(feeVpc, feeKit);
        return E(vp).getDepositFacet();
      },

      /**
       * Get the address of named module account.
       *
       * @param {string} moduleName
       * @returns {Promise<string | null>} address of named module account, or
       *   null if unimplemented (no bankChannel)
       */
      async getModuleAccountAddress(moduleName) {
        const { bankChannel } = this.state;
        if (!bankChannel) {
          return null;
        }

        return bankChannel.toBridge({
          type: 'VBANK_GET_MODULE_ACCOUNT_ADDRESS',
          moduleName,
        });
      },

      /**
       * Add an asset to the bank, and publish it to the subscriptions. If
       * nameAdmin is defined, update with denom to AssetInfo entry.
       *
       * Note that AssetInfo has the settled identity of the issuer, not just a
       * promise for it.
       *
       * @param {string} denom lower-level denomination string
       * @param {string} issuerName
       * @param {string} proposedName
       * @param {AssetIssuerKit & { payment?: ERef<Payment> }} kit ERTP issuer
       *   kit (mint, brand, issuer)
       */
      async addAsset(denom, issuerName, proposedName, kit) {
        const {
          assetPublisher,
          brandToAssetDescriptor,
          brandToAssetRecord,
          denomToAddressUpdater,
          nameAdmin,
        } = this.state;
        assert.typeof(denom, 'string');
        assert.typeof(issuerName, 'string');
        assert.typeof(proposedName, 'string');

        const brand = await kit.brand;
        const assetKind = await E(kit.issuer).getAssetKind();
        assert.equal(
          assetKind,
          AssetKind.NAT,
          `Only fungible assets are allowed, not ${assetKind}`,
        );

        // Create an escrow purse for this asset, seeded with the payment.
        const escrowPurse = E(kit.issuer).makeEmptyPurse();
        const payment = await kit.payment;
        await (payment && E(escrowPurse).deposit(payment));

        const [privateAssetRecord, toPublish] = await deeplyFulfilledObject(
          harden([
            {
              escrowPurse,
              issuer: kit.issuer,
              mint: kit.mint,
              denom,
              brand,
            },
            {
              brand,
              denom,
              issuerName,
              issuer: kit.issuer,
              proposedName,
            },
          ]),
        );
        brandToAssetRecord.init(brand, privateAssetRecord);
        denomToAddressUpdater.init(
          denom,
          detachedZone.mapStore('addressToUpdater'),
        );
        brandToAssetDescriptor.init(brand, toPublish);
        assetPublisher.publish(toPublish);

        if (!nameAdmin) {
          return;
        }
        // publish settled issuer identity
        void Promise.all([kit.issuer, E(kit.brand).getDisplayInfo()]).then(
          ([issuer, displayInfo]) =>
            E(nameAdmin).update(
              denom,
              /** @type {AssetInfo} */ (
                harden({
                  brand,
                  issuer,
                  issuerName,
                  denom,
                  proposedName,
                  displayInfo,
                })
              ),
            ),
        );
      },
      /**
       * Create a new personal bank interface for a given address.
       *
       * @param {string} address lower-level bank account address
       * @returns {Promise<Bank>}
       */
      async getBankForAddress(address) {
        const {
          addressToBank,
          assetSubscriber,
          brandToAssetDescriptor,
          brandToAssetRecord,
          bankChannel,
          denomToAddressUpdater,
        } = this.state;
        assert.typeof(address, 'string');
        if (addressToBank.has(address)) {
          return addressToBank.get(address).bank;
        }

        /** @type {MapStore<Brand, VirtualPurse>} */
        const brandToVPurse = detachedZone.mapStore('brandToVPurse');
        const bank = makeBank({
          address,
          assetSubscriber,
          brandToAssetDescriptor,
          brandToAssetRecord,
          bankChannel,
          brandToVPurse,
          denomToAddressUpdater,
        });
        addressToBank.init(address, harden({ bank, brandToVPurse }));
        return bank;
      },
    },
  );
  return makeBankManager;
};
/** @typedef {ReturnType<ReturnType<typeof prepareBankManager>>} BankManager */

/** @param {MapStore<string, any>} baggage */
const prepareFromBaggage = baggage => {
  const rootZone = makeDurableZone(baggage);

  const makePublishKit = prepareDurablePublishKit(
    rootZone.mapStore('publisher'),
    'PublishKit',
  );

  const provideAssetSubscription = prepareAssetSubscription(rootZone);

  const detachedZone = rootZone.detached();
  const makeVirtualPurse = prepareVirtualPurse(rootZone);
  const makeBank = prepareBank(rootZone, {
    provideAssetSubscription,
    makePublishKit,
    makeVirtualPurse,
  });
  const makeRewardPurseController = prepareRewardPurseController(rootZone);
  const makeBankChannelHandler = prepareBankChannelHandler(rootZone);

  /** @type {import('@agoric/internal/src/callback.js').MakeAttenuator<BridgeChannel>} */
  const makeBridgeChannelAttenuator = prepareGuardedAttenuator(
    rootZone.subZone('attenuators'),
    BridgeChannelI,
    {
      tag: 'BridgeChannelAttenuator',
    },
  );

  const makeBankManager = prepareBankManager(rootZone, {
    provideAssetSubscription,
    makeBank,
    makePublishKit,
    makeRewardPurseController,
    makeVirtualPurse,
  });

  return {
    detachedZone,
    provideAssetSubscription,
    makeBank,
    makeBankChannelHandler,
    makeBankManager,
    makeBridgeChannelAttenuator,
    makeRewardPurseController,
    makePublishKit,
    makeVirtualPurse,
  };
};

export function buildRootObject(_vatPowers, _args, baggage) {
  const {
    makeBankManager,
    detachedZone,
    makeBankChannelHandler,
    makeBridgeChannelAttenuator,
  } = prepareFromBaggage(baggage);

  return Far('bankMaker', {
    /**
     * @param {ERef<import('./types.js').ScopedBridgeManager | undefined>} [bankBridgeManagerP]
     *   a bridge manager for the "remote" bank (such as on cosmos-sdk). If not
     *   supplied (such as on sim-chain), we just use local purses.
     * @param {ERef<{ update: import('./types.js').NameAdmin['update'] }>} [nameAdminP]
     *   update facet of a NameAdmin; see addAsset() for detail.
     */
    async makeBankManager(
      bankBridgeManagerP = undefined,
      nameAdminP = undefined,
    ) {
      const bankBridgeManager = await bankBridgeManagerP;

      /** @type {MapStore<string, MapStore<string, BalanceUpdater>>} */
      const denomToAddressUpdater = detachedZone.mapStore(
        'denomToAddressUpdater',
      );

      /** @param {ERef<import('./types.js').ScopedBridgeManager>} [bankBridgeMgr] */
      async function getBankChannel(bankBridgeMgr) {
        // We do the logic here if the bridge manager is available.  Otherwise,
        // the bank is not "remote" (such as on sim-chain), so we just use
        // immediate purses instead of virtual ones.
        if (!bankBridgeMgr) {
          return undefined;
        }

        // We need to synchronise with the remote bank.
        const handler = makeBankChannelHandler(denomToAddressUpdater);
        await E(bankBridgeMgr).initHandler(handler);

        // We can only downcall to the bank if there exists a bridge manager.
        return makeBridgeChannelAttenuator({ target: bankBridgeMgr });
      }

      const [bankChannel, nameAdmin] = await Promise.all([
        getBankChannel(bankBridgeManager),
        nameAdminP,
      ]);
      return makeBankManager({
        bankChannel,
        denomToAddressUpdater,
        nameAdmin,
      });
    },
  });
}
