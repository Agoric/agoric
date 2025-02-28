import { E } from '@endo/far';
import { assertKey } from '@agoric/store';
import { canBeDurable } from '@agoric/vat-data';
import { makePromiseKit } from '@endo/promise-kit';

/**
 * @typedef {{
 *   onAddKey: (key: string) => void;
 *   onResolve: (key: string, value: ERef<unknown>) => void;
 *   onSettled: (key: string, remaining: Set<string>) => void;
 *   onReset: (key: string) => void;
 * }} PromiseSpaceHooks
 */

const noop = harden(() => {});

/**
 * @param {typeof console.log} log
 * @returns {PromiseSpaceHooks}
 */
export const makeLogHooks = log =>
  harden({
    onAddKey: name => log(`${name}: new Promise`),
    onSettled: (name, remaining) =>
      log(name, 'settled; remaining:', [...remaining.keys()].sort()),
    onReset: noop,
    onResolve: noop,
  });

/**
 * Note: caller is responsible for synchronization in case of onResolve() called
 * with a promise.
 *
 * @param {MapStore<string, import('@endo/marshal').Passable>} store
 * @param {typeof console.log} [log]
 * @returns {PromiseSpaceHooks}
 */
export const makeStoreHooks = (store, log = noop) => {
  const logHooks = makeLogHooks(log);

  const save = (name, value) => {
    try {
      assertKey(value);
    } catch (err) {
      console.warn('cannot save non-passable:', name, err.message);
      return;
    }
    if (!canBeDurable(value)) {
      console.warn('cannot save non-durable:', name, value);
      return;
    }
    if (store.has(name)) {
      store.set(name, value);
    } else {
      store.init(name, value);
    }
  };

  return harden({
    ...logHooks,
    onResolve: (name, valueP) => {
      void E.when(valueP, value => save(name, value));
    },
    onReset: name => {
      if (store.has(name)) {
        store.delete(name);
      }
    },
  });
};

/**
 * Make { produce, consume } where for each name, `consume[name]` is a promise
 * and `produce[name].resolve` resolves it.
 *
 * Note: repeated resolve()s without an intervening reset() are noops.
 *
 * @template {Record<string, unknown>} [T=Record<string, unknown>]
 * @param {({ log?: typeof console.log } & (
 *       | { hooks?: PromiseSpaceHooks }
 *       | { store: MapStore<string, any> }
 *     ))
 *   | typeof console.log} [optsOrLog]
 * @returns {PromiseSpaceOf<T>}
 */
export const makePromiseSpace = (optsOrLog = {}) => {
  const opts = typeof optsOrLog === 'function' ? { log: optsOrLog } : optsOrLog;
  const { log = noop } = opts;
  const hooks =
    'store' in opts
      ? makeStoreHooks(opts.store, log)
      : opts.hooks || makeLogHooks(log);
  const { onAddKey, onSettled, onResolve, onReset } = hooks;

  /** @typedef {{ pk: PromiseRecord<any>; isSettling: boolean }} PromiseState */
  /** @type {Map<string, PromiseState>} */
  const nameToState = new Map();
  /** @type {Set<string>} */
  const remaining = new Set();

  /** @type {(name: string) => PromiseState} */
  const provideState = name => {
    let state = nameToState.get(name);
    if (!state) {
      onAddKey(name);
      remaining.add(name);
      const pk = makePromiseKit();
      pk.promise
        .finally(() => {
          remaining.delete(name);
          onSettled(name, remaining);
        })
        .catch(() => {});
      state = harden({ pk, isSettling: false });
      nameToState.set(name, state);
    }
    return state;
  };

  // we must tolerate these producer methods being retrieved both
  // before and after the consumer is retrieved, and also both before
  // and after reset() is invoked, so they only close over 'name' and
  // not over any state variables

  const makeProducer = name => {
    const resolve = value => {
      const old = provideState(name);
      if (old.isSettling) {
        // First attempt to settle always wins.
        return;
      }
      onResolve(name, value);
      nameToState.set(name, harden({ ...old, isSettling: true }));
      old.pk.resolve(value);
    };
    const reject = reason => {
      const old = provideState(name);
      if (old.isSettling) {
        // First attempt to settle always wins.
        return;
      }
      nameToState.set(name, harden({ ...old, isSettling: true }));
      old.pk.reject(reason);
    };
    const reset = (reason = undefined) => {
      if (!nameToState.has(name)) {
        return;
      }
      const old = provideState(name);
      if (!old.isSettling) {
        // we haven't produced a value yet, and there might be
        // consumers still watching old.pk.promise
        if (reason === undefined) {
          // so just let them wait for the new value: resetting an
          // unresolved item is a no-op
          return;
        }
        // reject those watchers; new watchers will wait for the new
        // value through the replacement promise
        reject(reason);
      }

      // delete the state, so new callers will get a new promise kit
      onReset(name);
      nameToState.delete(name);
      remaining.delete(name);
    };

    return harden({ resolve, reject, reset });
  };

  /** @type {PromiseSpaceOf<T>['consume']} */
  // @ts-expect-error cast
  const consume = new Proxy(harden({}), {
    get: (_target, name) => {
      assert.typeof(name, 'string');
      return provideState(name).pk.promise;
    },
  });

  /** @type {PromiseSpaceOf<T>['produce']} */
  // @ts-expect-error cast
  const produce = new Proxy(harden({}), {
    get: (_target, name) => {
      assert.typeof(name, 'string');
      return makeProducer(name);
    },
  });

  return harden({ produce, consume });
};
harden(makePromiseSpace);
