import { assert, Fail, q } from '@endo/errors';
import { E } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { M, getInterfaceGuardPayload } from '@endo/patterns';

/// <reference path="./types.js" />
import {
  makeSyncMethodCallback,
  prepareGuardedAttenuator,
} from '@agoric/internal/src/callback.js';
import { makeHeapZone } from '@agoric/zone';
import { deeplyFulfilledObject, NonNullish } from '@agoric/internal';

const KeyShape = M.string();
const PathShape = M.arrayOf(KeyShape);

export const NameHubIKit = harden({
  nameHub: M.interface('NameHub', {
    has: M.call(KeyShape).returns(M.boolean()),
    lookup: M.call().rest(PathShape).returns(M.promise()),
    entries: M.call().returns(M.arrayOf(M.array())),
    values: M.call().returns(M.array()),
    keys: M.call().returns(M.arrayOf(KeyShape)),
  }),
  nameAdmin: M.interface('NameAdmin', {
    provideChild: M.callWhen(KeyShape)
      .optional(M.arrayOf(M.string()))
      .returns({ nameHub: M.remotable(), nameAdmin: M.remotable() }),
    reserve: M.call(KeyShape).returns(M.promise()),
    default: M.call(KeyShape).optional(M.any(), M.remotable()).returns(M.any()),
    set: M.call(KeyShape, M.any())
      .optional(M.remotable())
      .returns(M.undefined()),
    onUpdate: M.call(M.remotable()).returns(M.undefined()),
    update: M.call(KeyShape, M.any())
      .optional(M.remotable('newAdminValue'))
      .returns(M.any()),
    lookupAdmin: M.call().rest(M.arrayOf(KeyShape)).returns(M.promise()),
    delete: M.call(KeyShape).returns(M.any()),
    readonly: M.call().returns(M.remotable()),
  }),
});

/** @param {import('@agoric/zone').Zone} zone */
export const prepareMixinMyAddress = zone => {
  const MixinI = M.interface('MyAddressNameAdmin', {
    ...getInterfaceGuardPayload(NameHubIKit.nameAdmin).methodGuards,
    getMyAddress: M.call().returns(M.string()),
  });
  /**
   * @type {import('@agoric/internal/src/callback.js').MakeAttenuator<
   *   import('./types.js').MyAddressNameAdmin
   * >}
   */
  const mixin = prepareGuardedAttenuator(zone, MixinI, {
    tag: 'MyAddressNameAdmin',
  });

  // XXX: wish: constant callback
  const makeConstantFacet = zone.exoClass(
    'Konst',
    undefined, // TODO: interface guard
    value => ({ value }),
    {
      getValue() {
        return this.state.value;
      },
    },
  );

  /**
   * @param {import('./types.js').NameAdmin} nameAdmin
   * @param {string} address
   */
  const mixinMyAddress = (nameAdmin, address) => {
    const myAddressFacet = makeConstantFacet(address);
    return mixin({
      target: nameAdmin,
      overrides: {
        getMyAddress: makeSyncMethodCallback(myAddressFacet, 'getValue'),
      },
    });
  };

  return mixinMyAddress;
};

// ack: https://stackoverflow.com/a/35650427
/** @typedef {{ [key: string]: any }} NonPrimitive */

/**
 * @template {{}} K
 * @template {NonPrimitive} V
 * @param {WeakMap<K, V>} store
 * @param {K} key
 * @param {(k: K) => V} make
 */
const provideWeak = (store, key, make) => {
  if (store.has(key)) {
    return store.get(key) || assert.fail();
  }

  const it = make(key);
  store.set(key, it);
  return it;
};

/**
 * @param {import('./types.js').NameHubUpdateHandler | undefined} updateCallback
 * @param {import('./types.js').NameHub} hub
 * @param {unknown} [_newValue]
 */
const updated = (updateCallback, hub, _newValue = undefined) => {
  if (!updateCallback) {
    return;
  }

  // wait for values to settle before writing
  return E.when(deeplyFulfilledObject(hub.entries()), settledEntries =>
    E(updateCallback).write(settledEntries),
  );
};

/**
 * Make two facets of a node in a name hierarchy: the nameHub is read access and
 * the nameAdmin is write access.
 *
 * @param {import('@agoric/zone').Zone} zone
 */
export const prepareNameHubKit = zone => {
  const init1 = () => ({
    /** @type {Map<string, PromiseKit<unknown>>} */
    keyToPK: new Map(),
    /** @type {Map<string, PromiseKit<unknown>>} */
    keyToAdminPK: new Map(),
  });
  /** @type {WeakMap<any, ReturnType<init1>>} */
  const ephemera = new WeakMap();
  /** @param {{}} me */
  const my = me => provideWeak(ephemera, me, init1);

  /** @type {() => import('./types.js').NameHubKit} */
  const makeNameHubKit = zone.exoClassKit(
    'NameHubKit',
    NameHubIKit,
    /** @param {unknown[]} auxProperties */
    (...auxProperties) => ({
      /** @type {MapStore<string, unknown>} */
      keyToValue: zone.detached().mapStore('nameKey'),

      /** @type {MapStore<string, import('./types.js').NameAdmin>} */
      keyToAdmin: zone.detached().mapStore('nameKey'),

      /** @type {undefined | { write: (item: unknown) => void }} */
      updateCallback: undefined,

      auxProperties: harden(auxProperties),
    }),
    {
      nameHub: {
        has(key) {
          const { keyToValue } = this.state;
          const { keyToPK } = my(this.facets.nameHub);
          return keyToValue.has(key) || keyToPK.has(key);
        },
        async lookup(...path) {
          if (path.length === 0) {
            const { nameHub } = this.facets;
            return nameHub;
          }
          const { keyToValue } = this.state;
          const { keyToPK } = my(this.facets.nameHub);
          const [first, ...remaining] = path;
          /** @type {any} */
          const firstValue = keyToValue.has(first)
            ? keyToValue.get(first)
            : NonNullish(keyToPK.get(first), `"nameKey" not found: ${q(first)}`)
                .promise;
          if (remaining.length === 0) {
            return firstValue;
          }
          return E(firstValue).lookup(...remaining);
        },
        entries(includeReserved = true) {
          const { keyToValue } = this.state;
          if (!includeReserved) {
            return harden([...keyToValue.entries()]);
          }
          const { keyToPK } = my(this.facets.nameHub);
          // keys of keyToValue and keyToPK are disjoint
          const out = harden([
            ...keyToValue.entries(),
            ...[...keyToPK.entries()].map(
              ([k, kit]) =>
                /** @type {[string, ERef<unknown>]} */ ([k, kit.promise]),
            ),
          ]);
          return out;
        },
        values() {
          const { nameHub } = this.facets;
          return nameHub.entries().map(([_k, v]) => v);
        },
        keys() {
          const { nameHub } = this.facets;
          return nameHub.entries().map(([k, _v]) => k);
        },
      },
      nameAdmin: {
        async provideChild(key, reserved = []) {
          const { nameAdmin } = this.facets;
          const { keyToAdmin, keyToValue } = this.state;
          if (keyToAdmin.has(key)) {
            const childAdmin = keyToAdmin.get(key);
            /** @type {import('./types.js').NameHub} */

            // @ts-expect-error if an admin is present, it should be a namehub
            const childHub = keyToValue.get(key);
            return { nameHub: childHub, nameAdmin: childAdmin };
          }
          const child = makeNameHubKit();
          await Promise.all(reserved.map(k => child.nameAdmin.reserve(k)));
          void nameAdmin.update(key, child.nameHub, child.nameAdmin);
          return child;
        },
        async reserve(key) {
          const { keyToPK, keyToAdminPK } = my(this.facets.nameHub);
          const { keyToValue, keyToAdmin } = this.state;
          if (keyToValue.has(key)) {
            return;
          }
          if (!keyToAdminPK.has(key)) {
            const pk = makePromiseKit();
            keyToAdminPK.set(key, pk);
            pk.promise.then(
              v => {
                keyToAdmin.init(key, v);
                keyToAdminPK.delete(key);
              },
              () => {}, // ignore rejections
            );
          }
          if (!keyToPK.has(key)) {
            const pk = makePromiseKit();
            keyToPK.set(key, pk);
            pk.promise.then(
              v => {
                keyToValue.init(key, v);
                keyToPK.delete(key);
              },
              () => {}, // ignore rejections
            );
          }
        },
        default(key, newValue, adminValue) {
          const { nameHub, nameAdmin } = this.facets;
          if (nameHub.has(key)) {
            const { keyToValue } = this.state;

            if (keyToValue.has(key)) {
              // Already initalized.
              return /** @type {any} */ (keyToValue.get(key));
            }
          }
          void nameAdmin.update(key, newValue, adminValue);
          return newValue;
        },
        set(key, newValue, adminValue) {
          const { keyToValue } = this.state;
          keyToValue.has(key) || Fail`key ${key} is not already initialized`;

          const { nameAdmin } = this.facets;
          void nameAdmin.update(key, newValue, adminValue);
        },
        onUpdate(fn) {
          const { state } = this;
          if (state.updateCallback) {
            assert(!fn, 'updateCallback accidentally reassigned?');
          }
          state.updateCallback = fn;
        },
        update(key, newValue, adminValue) {
          const { keyToPK, keyToAdminPK } = my(this.facets.nameHub);
          const { keyToValue, keyToAdmin, updateCallback } = this.state;

          /**
           * @type {[
           *   Map<string, PromiseKit<unknown>>,
           *   MapStore<string, unknown>,
           *   unknown,
           * ][]}
           */
          const valueMapEntries = [
            [keyToAdminPK, keyToAdmin, adminValue],
            [keyToPK, keyToValue, newValue],
          ];
          for (const [pmap, vmap, value] of valueMapEntries) {
            if (pmap.has(key)) {
              const old = NonNullish(pmap.get(key));
              old.resolve(value);
            } else if (vmap.has(key)) {
              vmap.set(key, value);
            } else {
              vmap.init(key, value);
            }
          }

          const { nameHub } = this.facets;
          return updated(updateCallback, nameHub, newValue);
        },
        async lookupAdmin(...path) {
          const { nameAdmin } = this.facets;
          if (path.length === 0) {
            return nameAdmin;
          }

          const { keyToAdmin } = this.state;
          const { keyToAdminPK } = my(this.facets.nameHub);
          const [first, ...remaining] = path;

          /** @type {any} */
          const firstValue = keyToAdmin.has(first)
            ? keyToAdmin.get(first)
            : NonNullish(keyToAdminPK.get(first)).promise;

          if (remaining.length === 0) {
            return firstValue;
          }
          return E(firstValue).lookupAdmin(...remaining);
        },
        delete(key) {
          const { keyToPK, keyToAdminPK } = my(this.facets.nameHub);
          const { keyToValue, keyToAdmin, updateCallback } = this.state;
          for (const pmap of [keyToAdminPK, keyToPK]) {
            if (pmap.has(key)) {
              // Reject only if already exists.
              const old = NonNullish(pmap.get(key));
              old.reject(Error(`Value for ${key} has been deleted`));
              // Silence unhandled rejections.
              void old.promise.catch(_ => {});
            }
          }
          for (const map of [keyToValue, keyToAdmin, keyToPK, keyToAdminPK]) {
            if (map.has(key)) {
              map.delete(key);
            }
          }
          const { nameHub } = this.facets;
          return updated(updateCallback, nameHub);
        },
        readonly() {
          const { nameHub } = this.facets;
          return nameHub;
        },
      },
    },
  );

  return makeNameHubKit;
};

/**
 * Make two facets of a node in a name hierarchy: the nameHub is read access and
 * the nameAdmin is write access.
 *
 * @returns {import('./types.js').NameHubKit}
 */
export const makeNameHubKit = prepareNameHubKit(makeHeapZone());
