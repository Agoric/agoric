import { Fail } from '@agoric/assert';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import * as ActionType from '@agoric/internal/src/action-types.js';
import { makeMockChainStorageRoot } from '@agoric/internal/src/storage-test-utils.js';
import { eventLoopIteration } from '@agoric/internal/src/testing-utils.js';
import { makeScalarBigMapStore } from '@agoric/vat-data';
import { makeAgoricNamesAccess, makePromiseSpace } from '@agoric/vats';
import {
  installBootContracts,
  makeAddressNameHubs,
  makeBoard,
} from '@agoric/vats/src/core/basic-behaviors.js';
import { setupClientManager } from '@agoric/vats/src/core/chain-behaviors.js';
import { buildRootObject as boardRoot } from '@agoric/vats/src/vat-board.js';
import { buildRootObject as mintsRoot } from '@agoric/vats/src/vat-mints.js';
import { makeFakeBankManagerKit } from '@agoric/vats/tools/bank-utils.js';
import { makeRatio } from '@agoric/zoe/src/contractSupport/ratio.js';
import { setUpZoeForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { E, Far } from '@endo/far';

/**
 * @import {StoredFacet} from '@agoric/internal/src/lib-chainStorage.js';
 */

export { ActionType };

/**
 * @param {object} kit
 * @param {Brand<'nat'>} kit.brand
 * @param {Issuer<'nat'>} kit.issuer
 * @param {Mint<'nat'>} [kit.mint]
 */
export const withAmountUtils = kit => {
  return {
    ...kit,
    /**
     * @param {NatValue} v
     */
    make: v => AmountMath.make(kit.brand, v),
    makeEmpty: () => AmountMath.makeEmpty(kit.brand),
    /**
     * @param {NatValue} n
     * @param {NatValue} [d]
     */
    makeRatio: (n, d) => makeRatio(n, kit.brand, d),
  };
};
/** @typedef {ReturnType<typeof withAmountUtils>} AmountUtils */

/**
 * @param {ERef<StoredFacet>} subscription
 */
export const subscriptionKey = subscription => {
  return E(subscription)
    .getStoreKey()
    .then(storeKey => {
      const [prefix, unique] = storeKey.storeSubkey.split(':');
      prefix === 'fake' ||
        Fail`subscriptionKey helper only supports fake storage`;
      return unique;
    });
};

/** @returns {import('@agoric/vats').BridgeManager} */
const makeFakeBridgeManager = () =>
  // @ts-expect-error XXX generics puzzle: could be instantiated with a different subtype of constraint
  Far('fakeBridgeManager', {
    register(bridgeId, handler) {
      return Far('scopedBridgeManager', {
        getBridgeId() {
          return bridgeId;
        },
        fromBridge(_obj) {
          assert.fail(`expected fromBridge`);
        },
        toBridge(obj) {
          if (!handler) {
            Fail`No handler for ${bridgeId}`;
          }
          // Rely on interface guard for validation.
          // This should also be validated upstream but don't rely on it.
          // @ts-expect-error handler possibly undefined
          return E(handler).fromBridge(obj);
        },
        initHandler(newHandler) {
          !handler || Fail`Handler already set`;
          handler = newHandler;
        },
        setHandler(newHandler) {
          !!handler || Fail`Handler not set`;
          handler = newHandler;
        },
      });
    },
  });
/**
 * @param {any} log
 * @returns {Promise<ChainBootstrapSpace>} >}
 */
export const makeMockTestSpace = async log => {
  const space = /** @type {any} */ (makePromiseSpace(log));
  /**
   * @type {BootstrapPowers}
   */
  const { consume, produce } = space;
  const { agoricNames, agoricNamesAdmin, spaces } =
    await makeAgoricNamesAccess();
  produce.agoricNames.resolve(agoricNames);
  produce.agoricNamesAdmin.resolve(agoricNamesAdmin);

  const { zoe, feeMintAccessP } = await setUpZoeForTest();
  produce.zoe.resolve(zoe);
  produce.feeMintAccess.resolve(feeMintAccessP);

  const vatLoader = name => {
    switch (name) {
      case 'mints':
        return mintsRoot();
      case 'board': {
        const baggage = makeScalarBigMapStore('baggage');
        return boardRoot({}, {}, baggage);
      }
      default:
        throw Error('unknown loadVat name');
    }
  };
  produce.loadVat.resolve(vatLoader);
  produce.loadCriticalVat.resolve(vatLoader);

  const bldKit = makeIssuerKit('BLD');
  produce.bldIssuerKit.resolve(bldKit);
  produce.bridgeManager.resolve(makeFakeBridgeManager());

  const storageRoot = makeMockChainStorageRoot();
  produce.chainStorage.resolve(storageRoot);

  produce.testFirstAnchorKit.resolve(makeIssuerKit('AUSD', 'nat'));

  const { bankManager } = await makeFakeBankManagerKit();

  produce.bankManager.resolve(bankManager);

  await Promise.all([
    // @ts-expect-error
    makeBoard({ consume, produce, ...spaces }),
    makeAddressNameHubs({ consume, produce, ...spaces }),
    installBootContracts({ consume, produce, ...spaces }),
    setupClientManager({ consume, produce, ...spaces }),
  ]);

  return space;
};

/**
 * @param {ERef<{
 *   getPublicTopics: () => import('@agoric/zoe/src/contractSupport/index.js').TopicsRecord;
 * }>} hasTopics
 * @param {string} subscriberName
 */
export const topicPath = (hasTopics, subscriberName) => {
  return E(hasTopics)
    .getPublicTopics()
    .then(subscribers => subscribers[subscriberName])
    .then(tr => tr.storagePath);
};

/** @type {<T>(subscriber: ERef<Subscriber<T>>) => Promise<T>} */
export const headValue = async subscriber => {
  await eventLoopIteration();
  const record = await E(subscriber).subscribeAfter();
  return record.head.value;
};
