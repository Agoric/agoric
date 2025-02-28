import { allValues, objectMap } from '@agoric/internal';
import { provide } from '@agoric/vat-data';
import { E } from '@endo/eventual-send';

/**
 * @import {MapStore} from '@agoric/swingset-liveslots';
 */

/**
 * SCALE: Only for low cardinality provisioning. Every value from init() will
 * remain in the map for the lifetime of the heap. If a key object is GCed, its
 * representative also remains.
 *
 * @template {{}} E Ephemeral state
 * @template {WeakKey} K key on which to provision
 * @param {(key: K) => E} init
 */
export const makeEphemeraProvider = init => {
  /** @type {WeakMap<K, E>} */
  const extant = new WeakMap();

  /**
   * Provide an object to hold state that need not (or cannot) be durable.
   *
   * @type {(key: K) => E}
   */
  return key => {
    if (extant.has(key)) {
      // @ts-expect-error cast
      return extant.get(key);
    }
    const newEph = init(key);
    extant.set(key, newEph);
    return newEph;
  };
};
harden(makeEphemeraProvider);

/**
 * Provide an empty ZCF seat.
 *
 * @param {ZCF} zcf
 * @param {import('@agoric/swingset-liveslots').Baggage} baggage
 * @param {string} name
 * @returns {ZCFSeat}
 */
export const provideEmptySeat = (zcf, baggage, name) => {
  return provide(baggage, name, () => zcf.makeEmptySeatKit().zcfSeat);
};
harden(provideEmptySeat);

/**
 * For use in contract upgrades to provide values that come from other vats.
 * All vats must be able to finish their upgrade without contacting other vats,
 * so whatever values an instance needs from other vats must be saved in the first
 * incarnation and read from baggage in each subsequent.
 *
 * This abstracts that condition so that the contract can convert a dictionary
 * of thunks into a dictionary of values during its first `prepare` (start).
 * Each subsequent `prepare` call will automatically read from the baggage and
 * eschew remote calls.
 *
 * The values are thunks instead of promises so that they don't start executing
 * unnecessarily or induce failures.
 *
 * For example,
 *
 *     const invitationIssuerP = E(zoe).getInvitationIssuer();
 *     const {
 *       invitationIssuer,
 *       invitationBrand,
 *     } = await provideAll(baggage, {
 *       invitationIssuer: () => invitationIssuerP,
 *       invitationBrand: () => E(invitationIssuerP).getBrand(),
 *     });
 *
 * @template {Record<string, () => ERef<any>>} T dict of thunks (promise makers)
 * @param {MapStore<string, any>} baggage
 * @param {T} thunks
 * @returns {Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }>}
 */
export const provideAll = (baggage, thunks) => {
  const keys = Object.keys(thunks);
  // assume if any keys are defined they all are
  const inBaggage = baggage.has(keys[0]);
  if (inBaggage) {
    const obj = objectMap(thunks, (_, k) => baggage.get(k));
    return Promise.resolve(harden(obj));
  }

  const keyedPromises = objectMap(thunks, fn => fn());

  return allValues(keyedPromises).then(keyedVals => {
    for (const [k, v] of Object.entries(keyedVals)) {
      baggage.init(k, v);
    }
    return keyedVals;
  });
};
harden(provideAll);

/**
 * Like provideAsync in AtomicProvider but assumes only one call so there are no race conditions.
 * Additionally offers a `withValue` helper useful for triggering procesess on a provided object.
 *
 * @see {makeAtomicProvider}
 * @see {AtomicProvider}
 * @template {() => ERef<any>} T
 * @param {import('@agoric/vat-data').Baggage} mapStore
 * @param {string} key
 * @param {T} makeValue
 * @param {(value: Awaited<ReturnType<T>>) => void} [withValue]
 * @returns {Promise<Awaited<ReturnType<T>>>}
 */
export const provideSingleton = (mapStore, key, makeValue, withValue) => {
  const stored = mapStore.has(key)
    ? undefined
    : E.when(makeValue(), v => mapStore.init(key, harden(v)));

  return E.when(stored, () => {
    const value = mapStore.get(key);
    if (withValue) {
      withValue(value);
    }
    return value;
  });
};
