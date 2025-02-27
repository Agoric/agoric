// @ts-check
import { Fail, makeError, q } from '@endo/errors';
import { E } from '@endo/far';
import { isObject } from '@endo/marshal';
import { getInterfaceMethodKeys } from '@endo/patterns';

/** @import {ERef} from '@endo/far' */
/** @import {Callback, SyncCallback} from './types.js' */

const { fromEntries } = Object;

const { ownKeys: rawOwnKeys } = Reflect;
const ownKeys =
  /** @type {<T extends PropertyKey>(obj: { [K in T]?: unknown }) => T[]} */ (
    rawOwnKeys
  );

/**
 * @template {import('@endo/exo').Methods} T
 * @typedef {(
 *   ...args: Parameters<ReturnType<prepareAttenuator>>
 * ) => import('@endo/exo').Farable<T>} MakeAttenuator
 */

/**
 * @param {unknown} key
 * @returns {key is PropertyKey} FIXME: should be just `PropertyKey` but TS
 *   complains it can't be used as an index type.
 */
const isPropertyKey = key => {
  switch (typeof key) {
    case 'string':
    case 'number':
    case 'symbol':
      return true;
    default:
      return false;
  }
};

/**
 * Synchronously call a callback.
 *
 * @template {(...args: any[]) => any} I
 * @param {SyncCallback<I>} callback
 * @param {Parameters<I>} args
 * @returns {ReturnType<I>}
 */
export const callSync = (callback, ...args) => {
  const { target, methodName, bound } = callback;
  if (methodName === undefined) {
    return target(...bound, ...args);
  }
  return target[methodName](...bound, ...args);
};
harden(callSync);

/**
 * Eventual send to a callback.
 *
 * @template {(...args: any[]) => any} I
 * @param {Callback<I>} callback
 * @param {Parameters<I>} args
 * @returns {Promise<Awaited<ReturnType<I>>>}
 */
export const callE = (callback, ...args) => {
  const { target, methodName, bound } = callback;
  if (methodName === undefined) {
    return E(target)(...bound, ...args);
  }
  return E(target)[methodName](...bound, ...args);
};
harden(callE);

/**
 * Create a callback from a near function.
 *
 * @template {(...args: any[]) => any} I
 * @template {(...args: [...B, ...Parameters<I>]) => ReturnType<I>} [T=I]
 * @template {any[]} [B=[]]
 * @param {T} target
 * @param {B} bound
 * @returns {SyncCallback<I>}
 */
export const makeSyncFunctionCallback = (target, ...bound) => {
  typeof target === 'function' ||
    Fail`sync function callback target must be a function: ${target}`;
  /** @type {unknown} */
  const cb = harden({ target, bound, isSync: true });
  return /** @type {SyncCallback<I>} */ (cb);
};
harden(makeSyncFunctionCallback);

/**
 * Create a callback from a potentially far function.
 *
 * @template {(...args: any[]) => any} I
 * @template {ERef<(...args: [...B, ...Parameters<I>]) => ReturnType<I>>} [T=ERef<I>]
 * @template {any[]} [B=[]]
 * @param {T} target
 * @param {B} bound
 * @returns {Callback<I>}
 */
export const makeFunctionCallback = (target, ...bound) => {
  isObject(target) ||
    Fail`function callback target must be a function presence: ${target}`;
  /** @type {unknown} */
  const cb = harden({ target, bound });
  return /** @type {Callback<I>} */ (cb);
};
harden(makeFunctionCallback);

/**
 * Create a callback from a near method.
 *
 * @template {(...args: any[]) => any} I
 * @template {PropertyKey} P
 * @template {{
 *   [x in P]: (...args: [...B, ...Parameters<I>]) => ReturnType<I>;
 * }} [T={ [x in P]: I }]
 * @template {any[]} [B=[]]
 * @param {T} target
 * @param {P} methodName
 * @param {B} bound
 * @returns {SyncCallback<I>}
 */
export const makeSyncMethodCallback = (target, methodName, ...bound) => {
  isObject(target) ||
    Fail`sync method callback target must be an object: ${target}`;
  typeof methodName === 'string' ||
    Fail`method name must be a string: ${methodName}`;
  /** @type {unknown} */
  const cb = harden({ target, methodName, bound, isSync: true });
  return /** @type {SyncCallback<I>} */ (cb);
};
harden(makeSyncMethodCallback);

/**
 * Create a callback from a potentially far method.
 *
 * @template {(...args: any[]) => any} I
 * @template {PropertyKey} P
 * @template {ERef<{
 *   [x in P]: (...args: [...B, ...Parameters<I>]) => ReturnType<I>;
 * }>} [T=ERef<{ [x in P]: I }>]
 * @template {any[]} [B=[]]
 * @param {T} target
 * @param {P} methodName
 * @param {B} bound
 * @returns {Callback<I>}
 */
export const makeMethodCallback = (target, methodName, ...bound) => {
  isObject(target) || Fail`method callback target must be an object: ${target}`;
  typeof methodName === 'string' ||
    Fail`method name must be a string: ${methodName}`;
  /** @type {unknown} */
  const cb = harden({ target, methodName, bound });
  return /** @type {Callback<I>} */ (cb);
};
harden(makeMethodCallback);

/**
 * @param {any} callback
 * @returns {callback is Callback<any>}
 */
export const isCallback = callback => {
  if (!isObject(callback)) {
    return false;
  }
  const { target, methodName, bound } = callback;
  return (
    isObject(target) &&
    (methodName === undefined || typeof methodName === 'string') &&
    Array.isArray(bound)
  );
};
harden(isCallback);

/**
 * Prepare an attenuator class whose methods can be redirected via callbacks.
 *
 * @template {PropertyKey} M
 * @param {import('@agoric/base-zone').Zone} zone The zone in which to allocate
 *   attenuators.
 * @param {M[]} methodNames Methods to forward.
 * @param {object} opts
 * @param {import('@endo/patterns').InterfaceGuard<{
 *   [K in M]: import('@endo/patterns').MethodGuard;
 * }>} [opts.interfaceGuard]
 *   An interface guard for the new attenuator.
 * @param {string} [opts.tag] A tag for the new attenuator exoClass.
 */
export const prepareAttenuator = (
  zone,
  methodNames,
  { interfaceGuard, tag = 'Attenuator' } = {},
) => {
  /**
   * @typedef {(this: any, ...args: any[]) => any} Method
   *
   * @typedef {{ [K in M]?: Callback<any> | null }} Overrides
   *
   * @typedef {{ [K in M]: (this: any, ...args: any[]) => any }} Methods
   */
  const methods = /** @type {Methods} */ (
    fromEntries(
      methodNames.map(key => {
        // Only allow the `PropertyKey` type for the target method key.
        if (!isPropertyKey(key)) {
          throw Fail`key ${q(key)} is not a PropertyKey`;
        }

        const m = /** @type {Methods} */ ({
          // Explicitly use concise method syntax to preserve `this` but prevent
          // constructor behavior.
          /** @type {Method} */
          [key](...args) {
            // Support both synchronous and async callbacks.
            const cb = this.state.cbs[key];
            if (!cb) {
              const err = makeError(`unimplemented ${q(tag)} method ${q(key)}`);
              if (this.state.isSync) {
                throw err;
              }
              return Promise.reject(err);
            }
            if (cb.isSync) {
              return callSync(cb, ...args);
            }
            return callE(cb, ...args);
          },
        })[key];
        return /** @type {const} */ ([key, m]);
      }),
    )
  );

  /**
   * Create an exo object whose behavior is composed from a default target
   * and/or individual method override callbacks.
   *
   * @param {object} opts
   * @param {unknown} [opts.target] The target for any methods that weren't
   *   specified in `opts.overrides`.
   * @param {boolean} [opts.isSync=false] Whether the target should be treated
   *   as synchronously available.
   * @param {Overrides} [opts.overrides] Set individual callbacks for methods
   *   (whose names must be defined in the `prepareAttenuator` or
   *   `prepareGuardedAttenuator` call). Nullish overrides mean to throw.
   */
  const makeAttenuator = zone.exoClass(
    tag,
    interfaceGuard,
    /**
     * @param {object} opts
     * @param {any} [opts.target]
     * @param {boolean} [opts.isSync]
     * @param {Overrides} [opts.overrides]
     */
    ({
      target = null,
      isSync = false,
      overrides = /** @type {Overrides} */ ({}),
    }) => {
      const cbs = /** @type {Overrides} */ ({});

      const remaining = new Set(methodNames);
      for (const key of ownKeys(overrides)) {
        remaining.has(key) ||
          Fail`${q(tag)} overrides[${q(key)}] not allowed by methodNames`;

        remaining.delete(key);
        const cb = overrides[key];
        cb == null ||
          isCallback(cb) ||
          Fail`${q(tag)} overrides[${q(key)}] is not a callback; got ${cb}`;
        cbs[key] = cb;
      }
      for (const key of remaining) {
        if (isSync) {
          cbs[key] = makeSyncMethodCallback(target, key);
        } else {
          cbs[key] = makeMethodCallback(target, key);
        }
      }
      return harden({ cbs, isSync });
    },
    /** @type {Methods} */ (methods),
  );
  return makeAttenuator;
};
harden(prepareAttenuator);

/**
 * Prepare an attenuator whose methodNames are derived from the interfaceGuard.
 *
 * @template {import('@endo/patterns').InterfaceGuard} G
 * @param {import('@agoric/base-zone').Zone} zone
 * @param {G} interfaceGuard
 * @param {object} [opts]
 * @param {string} [opts.tag]
 */
export const prepareGuardedAttenuator = (zone, interfaceGuard, opts = {}) => {
  const methodNames = getInterfaceMethodKeys(interfaceGuard);
  const makeAttenuator = prepareAttenuator(zone, methodNames, {
    ...opts,
    interfaceGuard,
  });
  return /** @type {MakeAttenuator<any>} */ (makeAttenuator);
};
harden(prepareGuardedAttenuator);
