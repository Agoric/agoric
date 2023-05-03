// @ts-check
import { isPromise, makePromiseKit } from '@endo/promise-kit';

/**
 * @template [V=unknown]
 * @typedef {{
 *   onAddKey: (key: string) => void,
 *   onResolve: (key: string, value: ERef<V>) => void,
 *   onSettled: (key: string, remaining: Set<string>) => void,
 *   onReset: (key: string) => void,
 * }} PromiseSpaceHooks
 */

const noop = harden(() => {});

/**
 * @param { typeof console.log } log
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
 * Note: caller is responsible for synchronization
 * in case of onResolve() called with a promise.
 *
 * @template [V=unknown]
 * @param {MapStore<string, V>} store
 * @param { typeof console.log } [log]
 * @returns {PromiseSpaceHooks<V>}
 */
export const makeStoreHooks = (store, log = noop) => {
  const logHooks = makeLogHooks(log);
  return harden({
    ...logHooks,
    onResolve: (name, valueP) => {
      if (isPromise(valueP)) {
        void valueP.then(value => store.init(name, value));
      } else {
        store.init(name, /** @type {V} */ (/** @type {any} */ (valueP)));
      }
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
 * Note: repeated resolve()s are noops.
 *
 * @template [V=unknown]
 * @param {{ log?: typeof console.log } & (
 *  { hooks?: PromiseSpaceHooks<V> } | { store: MapStore<string, V> }
 * )} [opts]
 * @returns {PromiseSpace<V>}
 */
export const makePromiseSpace = (opts = {}) => {
  const { log = noop } = opts;
  const hooks =
    'store' in opts
      ? makeStoreHooks(opts.store, log)
      : opts.hooks || makeLogHooks(log);
  const { onAddKey, onSettled, onResolve, onReset } = hooks;

  /**
   * @typedef {PromiseRecord<V> & {
   *   reset: (reason?: unknown) => void,
   *   isSettling: boolean,
   * }} PromiseState
   */
  /** @type {Map<string, PromiseState>} */
  const nameToState = new Map();
  /** @type {Set<string>} */
  const remaining = new Set();

  /** @param {string} name */
  const provideState = name => {
    /** @type {PromiseState} */
    let state;
    const currentState = nameToState.get(name);
    if (currentState) {
      state = currentState;
    } else {
      onAddKey(name);
      const pk = makePromiseKit();

      pk.promise
        .finally(() => {
          remaining.delete(name);
          onSettled(name, remaining);
        })
        .catch(() => {});

      const settling = () => {
        assert(state);
        state = harden({ ...state, isSettling: true });
        nameToState.set(name, state);
      };

      const resolve = value => {
        settling();
        onResolve(name, value);
        pk.resolve(value);
      };
      const reject = reason => {
        settling();
        pk.reject(reason);
      };

      const reset = (reason = undefined) => {
        onReset(name);
        if (!state.isSettling) {
          if (!reason) {
            // Reuse the old promise; don't reject it.
            return;
          }
          reject(reason);
        }
        // Now publish a new promise.
        nameToState.delete(name);
        remaining.delete(name);
      };

      state = harden({
        isSettling: false,
        resolve,
        reject,
        reset,
        promise: pk.promise,
      });
      nameToState.set(name, state);
      remaining.add(name);
    }
    return state;
  };

  const consume = new Proxy(
    {},
    {
      get: (_target, name) => {
        assert.typeof(name, 'string');
        const kit = provideState(name);
        return kit.promise;
      },
    },
  );

  const produce = new Proxy(
    {},
    {
      get: (_target, name) => {
        assert.typeof(name, 'string');
        const { reject, resolve, reset } = provideState(name);
        return harden({ reject, resolve, reset });
      },
    },
  );

  return harden({ produce, consume });
};
harden(makePromiseSpace);
