// @ts-check
/**
 * @file provides a `makeE` that can be parameterized with an `unwrap` function
 * and corresponding `import('./types').EUnwrap<T>`.  These will be used to
 * extract the final settlement from a chain of PromiseLikes and PromiseSteps or
 * similar non-thenable pseudo-promises.
 *
 * `@agoric/vow/vat.js` uses this mechanism to export a `V` function with
 * similar behaviour as the default `E`, augmented with automatic unwrapping of
 * recipient Vows as if they were PromiseLikes.
 */

/*
 * TODO: Once this implementation has been polished and well-tested, it is
 * designed to be a drop-in replacement for the version in
 * `@endo/eventual-send/src/E.js` which contained no concept of "unwrap",
 */
import { X, q, Fail, makeError } from '@endo/errors';
import { trackTurns } from './track-turns.js';
import { makeMessageBreakpointTester } from './message-breakpoints.js';

const { assign, create } = Object;

const onSend = makeMessageBreakpointTester('ENDO_SEND_BREAKPOINTS');

/**
 * @import { HandledPromiseConstructor, RemotableBrand } from '@endo/eventual-send'
 * @import { EUnwrap } from './types.js'
 */
/** @typedef {(...args: unknown[]) => any} Callable */

/** @type {ProxyHandler<any>} */
const baseFreezableProxyHandler = {
  set(_target, _prop, _value) {
    return false;
  },
  isExtensible(_target) {
    return false;
  },
  setPrototypeOf(_target, _value) {
    return false;
  },
  deleteProperty(_target, _prop) {
    return false;
  },
};

// E Proxy handlers pretend that any property exists on the target and returns
// a function for their value. While this function is "bound" by context, it is
// meant to be called as a method. For that reason, the returned function
// includes a check that the `this` argument corresponds to the initial
// receiver when the function was retrieved.
// E Proxy handlers also forward direct calls to the target in case the remote
// is a function instead of an object. No such receiver checks are necessary in
// that case.

/**
 * A Proxy handler for E(x).
 *
 * @param {any} recipient Any value passed to E(x)
 * @param {HandledPromiseConstructor} HandledPromise
 * @param {<T>(x: T) => Promise<EUnwrap<T>>} unwrap
 * @returns {ProxyHandler<any>} the Proxy handler
 */
const makeEProxyHandler = (recipient, HandledPromise, unwrap) =>
  harden({
    ...baseFreezableProxyHandler,
    get: (_target, propertyKey, receiver) => {
      return harden(
        {
          /**
           * This function purposely checks the `this` value (see above)
           * In order to be `this` sensitive it is defined using concise method
           * syntax rather than as an arrow function. To ensure the function
           * is not constructable, it also avoids the `function` syntax.
           * @param  {...any[]} args
           */
          [propertyKey](...args) {
            if (this !== receiver) {
              // Reject the async function call
              return HandledPromise.reject(
                makeError(
                  X`Unexpected receiver for "${q(propertyKey)}" method of E(${q(
                    recipient,
                  )})`,
                ),
              );
            }

            if (onSend && onSend.shouldBreakpoint(recipient, propertyKey)) {
              // eslint-disable-next-line no-debugger
              debugger; // LOOK UP THE STACK
              // Stopped at a breakpoint on eventual-send of a method-call message,
              // so that you can walk back on the stack to see how we came to
              // make this eventual-send
            }
            return unwrap(
              HandledPromise.applyMethod(unwrap(recipient), propertyKey, args),
            );
          },
          // @ts-expect-error https://github.com/microsoft/TypeScript/issues/50319
        }[propertyKey],
      );
    },
    apply: async (_target, _thisArg, argArray = []) => {
      if (onSend && onSend.shouldBreakpoint(recipient, undefined)) {
        // eslint-disable-next-line no-debugger
        debugger; // LOOK UP THE STACK
        // Stopped at a breakpoint on eventual-send of a function-call message,
        // so that you can walk back on the stack to see how we came to
        // make this eventual-send
      }
      return unwrap(HandledPromise.applyFunction(unwrap(recipient), argArray));
    },
    has: (_target, _p) => {
      // We just pretend everything exists.
      return true;
    },
  });

/**
 * A Proxy handler for E.sendOnly(x)
 * It is a variant on the E(x) Proxy handler.
 *
 * @param {any} recipient Any value passed to E.sendOnly(x)
 * @param {HandledPromiseConstructor} HandledPromise
 * @param {<T>(x: T) => Promise<EUnwrap<T>>} unwrap
 * @returns {ProxyHandler<any>} the Proxy handler
 */
const makeESendOnlyProxyHandler = (recipient, HandledPromise, unwrap) =>
  harden({
    ...baseFreezableProxyHandler,
    get: (_target, propertyKey, receiver) => {
      return harden(
        {
          /**
           * This function purposely checks the `this` value (see above)
           * In order to be `this` sensitive it is defined using concise method
           * syntax rather than as an arrow function. To ensure the function
           * is not constructable, it also avoids the `function` syntax.
           * @param  {...any[]} args
           */
          [propertyKey](...args) {
            // Throw since the function returns nothing
            this === receiver ||
              Fail`Unexpected receiver for "${q(
                propertyKey,
              )}" method of E.sendOnly(${q(recipient)})`;
            if (onSend && onSend.shouldBreakpoint(recipient, propertyKey)) {
              // eslint-disable-next-line no-debugger
              debugger; // LOOK UP THE STACK
              // Stopped at a breakpoint on eventual-send of a method-call message,
              // so that you can walk back on the stack to see how we came to
              // make this eventual-send
            }
            HandledPromise.applyMethodSendOnly(
              unwrap(recipient),
              propertyKey,
              args,
            );
            return undefined;
          },
          // @ts-expect-error https://github.com/microsoft/TypeScript/issues/50319
        }[propertyKey],
      );
    },
    apply: (_target, _thisArg, argsArray = []) => {
      if (onSend && onSend.shouldBreakpoint(recipient, undefined)) {
        // eslint-disable-next-line no-debugger
        debugger; // LOOK UP THE STACK
        // Stopped at a breakpoint on eventual-send of a function-call message,
        // so that you can walk back on the stack to see how we came to
        // make this eventual-send
      }
      HandledPromise.applyFunctionSendOnly(unwrap(recipient), argsArray);
      return undefined;
    },
    has: (_target, _p) => {
      // We just pretend that everything exists.
      return true;
    },
  });

/**
 * A Proxy handler for E.get(x)
 * It is a variant on the E(x) Proxy handler.
 *
 * @param {any} x Any value passed to E.get(x)
 * @param {HandledPromiseConstructor} HandledPromise
 * @param {<T>(x: T) => Promise<EUnwrap<T>>} unwrap
 * @returns {ProxyHandler<any>} the Proxy handler
 */
const makeEGetProxyHandler = (x, HandledPromise, unwrap) =>
  harden({
    ...baseFreezableProxyHandler,
    has: (_target, _prop) => true,
    get: async (_target, prop) => HandledPromise.get(unwrap(x), prop),
  });

/** @param {any} x */
const resolve = async x => HandledPromise.resolve(x);

/**
 * @template [A={}]
 * @param {HandledPromiseConstructor} HandledPromise
 * @param {object} [powers]
 * @param {<T>(x: T) => Promise<EUnwrap<T>>} [powers.unwrap]
 * @param {A} [powers.additional]
 */
const makeE = (HandledPromise, powers = {}) => {
  const {
    additional = /** @type {A} */ ({}),
    unwrap = /** @type {NonNullable<typeof powers.unwrap>} */ (resolve),
  } = powers;

  return harden(
    assign(
      /**
       * E(x) returns a proxy on which you can call arbitrary methods. Each of these
       * method calls returns a promise. The method will be invoked on whatever
       * 'x' designates (or resolves to) in a future turn, not this one.
       *
       * @template T
       * @param {T} x target for method/function call
       * @returns {ECallableOrMethods<RemoteFunctions<T>>} method/function call proxy
       */
      x =>
        harden(
          new Proxy(() => {}, makeEProxyHandler(x, HandledPromise, unwrap)),
        ),
      {
        /**
         * E.get(x) returns a proxy on which you can get arbitrary properties.
         * Each of these properties returns a promise for the property.  The promise
         * value will be the property fetched from whatever 'x' designates (or
         * resolves to) in a future turn, not this one.
         *
         * @template T
         * @param {T} x target for property get
         * @returns {EGetters<LocalRecord<T>>} property get proxy
         * @readonly
         */
        get: x =>
          harden(
            new Proxy(
              create(null),
              makeEGetProxyHandler(x, HandledPromise, unwrap),
            ),
          ),

        /**
         * E.resolve(x) converts x to a handled promise. It is
         * shorthand for HandledPromise.resolve(x)
         *
         * @template T
         * @param {T} x value to convert to a handled promise
         * @returns {Promise<Awaited<T>>} handled promise for x
         * @readonly
         */
        resolve: async x => resolve(unwrap(x)),

        /**
         * E.sendOnly returns a proxy similar to E, but for which the results
         * are ignored (undefined is returned).
         *
         * @template T
         * @param {T} x target for method/function call
         * @returns {ESendOnlyCallableOrMethods<RemoteFunctions<T>>} method/function call proxy
         * @readonly
         */
        sendOnly: x =>
          harden(
            new Proxy(
              () => {},
              makeESendOnlyProxyHandler(x, HandledPromise, unwrap),
            ),
          ),

        /**
         * E.when(x, res, rej) is equivalent to
         * unwrap(x).then(onfulfilled, onrejected)
         *
         * @template T
         * @template [TResult1=EUnwrap<T>]
         * @template [TResult2=never]
         * @param {ERef<T>} x value to convert to a handled promise
         * @param {(value: EUnwrap<T>) => ERef<TResult1>} [onfulfilled]
         * @param {(reason: any) => ERef<TResult2>} [onrejected]
         * @returns {Promise<TResult1 | TResult2>}
         * @readonly
         */
        when: async (x, onfulfilled, onrejected) => {
          const unwrapped = resolve(unwrap(x));
          if (onfulfilled == null && onrejected == null) {
            return unwrapped;
          }
          return unwrapped.then(
            ...trackTurns(/** @type {const} */ ([onfulfilled, onrejected])),
          );
        },
      },
      additional,
    ),
  );
};

export default makeE;

/** @typedef {ReturnType<makeE>} EProxy */

/**
 * `DataOnly<T>` means to return a record type `T2` consisting only of
 * properties that are *not* functions.
 *
 * @template T The type to be filtered.
 * @typedef {Omit<T, FilteredKeys<T, Callable>>} DataOnly
 */

/**
 * @see {@link https://github.com/microsoft/TypeScript/issues/31394}
 * @template T
 * @typedef {PromiseLike<T> | T} ERef
 */

/**
 * @template {Callable} T
 * @typedef {ReturnType<T> extends EUnwrap<ReturnType<T>>
 *     ? (...args: Parameters<T>) => Promise<ReturnType<T>>
 *     : ReturnType<T> extends Promise<EUnwrap<ReturnType<T>>>
 *       ? T
 *       : (...args: Parameters<T>) => Promise<EUnwrap<ReturnType<T>>>} ECallable
 */

/**
 * @template T
 * @typedef {{
 *   readonly [P in keyof T]: T[P] extends Callable
 *     ? ECallable<T[P]>
 *     : never;
 * }} EMethods
 */

/**
 * @template T
 * @typedef {{
 *   readonly [P in keyof T]: T[P] extends PromiseLike<any>
 *     ? T[P]
 *     : Promise<Awaited<T[P]>>;
 * }} EGetters
 */

/**
 * @template {Callable} T
 * @typedef {(...args: Parameters<T>) => Promise<void>} ESendOnlyCallable
 */

/**
 * @template T
 * @typedef {{
 *   readonly [P in keyof T]: T[P] extends Callable
 *     ? ESendOnlyCallable<T[P]>
 *     : never;
 * }} ESendOnlyMethods
 */

/**
 * @template T
 * @typedef {(
 *   T extends Callable
 *     ? ESendOnlyCallable<T> & ESendOnlyMethods<Required<T>>
 *     : ESendOnlyMethods<Required<T>>
 * )} ESendOnlyCallableOrMethods
 */

/**
 * @template T
 * @typedef {(
 *   T extends Callable
 *     ? ECallable<T> & EMethods<Required<T>>
 *     : EMethods<Required<T>>
 * )} ECallableOrMethods
 */

/**
 * Return a union of property names/symbols/numbers P for which the record element T[P]'s type extends U.
 *
 * Given const x = { a: 123, b: 'hello', c: 42, 49: () => {}, 53: 67 },
 *
 * FilteredKeys<typeof x, number> is the type 'a' | 'c' | 53.
 * FilteredKeys<typeof x, string> is the type 'b'.
 * FilteredKeys<typeof x, 42 | 67> is the type 'c' | 53.
 * FilteredKeys<typeof x, boolean> is the type never.
 *
 * @template T
 * @template U
 * @typedef {{ [P in keyof T]: T[P] extends U ? P : never; }[keyof T]} FilteredKeys
 */

/**
 * `PickCallable<T>` means to return a single root callable or a record type
 * consisting only of properties that are functions.
 *
 * @template T
 * @typedef {(
 *   T extends Callable
 *     ? (...args: Parameters<T>) => ReturnType<T>   // a root callable, no methods
 *     : FilteredKeys<T, Callable> extends never
 *     ? never
 *     : Pick<T, FilteredKeys<T, Callable>>          // any callable methods
 * )} PickCallable
 */

/**
 * `RemoteFunctions<T>` means to return the functions and properties that are remotely callable.
 *
 * @template T
 * @typedef {(
 *   EUnwrap<T> extends RemotableBrand<any, infer R>  // if a given T will settle to some remote interface R
 *     ? PickCallable<R>                         // then return the callable properties of R
 *     : PickCallable<EUnwrap<T>>                 // otherwise return the callable properties of the settled T
 * )} RemoteFunctions
 */

/**
 * @template T
 * @typedef {(
 *   T extends RemotableBrand<infer L, any>
 *     ? L
 *     : EUnwrap<T>
 * )} LocalRecord
 */

/**
 * Type for an object that must only be invoked with E.  It supports a given
 * interface but declares all the functions as asyncable.
 *
 * @template T
 * @typedef {(
 *   T extends Callable
 *     ? (...args: Parameters<T>) => ERef<Awaited<EOnly<ReturnType<T>>>>
 *     : T extends Record<PropertyKey, Callable>
 *     ? {
 *         [K in keyof T]: T[K] extends Callable
 *           ? (...args: Parameters<T[K]>) => ERef<Awaited<EOnly<ReturnType<T[K]>>>>
 *           : T[K];
 *       }
 *     : T
 * )} EOnly
 */
