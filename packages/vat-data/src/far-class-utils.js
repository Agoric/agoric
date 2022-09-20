// @ts-check
import { initEmpty } from '@agoric/store';

import { provideKindHandle } from './kind-utils.js';
import {
  defineKind,
  defineKindMulti,
  defineDurableKind,
  defineDurableKindMulti,
  provide,
} from './vat-data-bindings.js';

/** @template L,R @typedef {import('@endo/eventual-send').RemotableBrand<L, R>} RemotableBrand */
/** @template T @typedef {import('@endo/eventual-send').ERef<T>} ERef */
// FIXME import InterfaceGuard from @agoric/store
/** @typedef {*} InterfaceGuard */
/** @typedef {import('./types.js').Baggage} Baggage */
/** @template T @typedef {import('./types.js').DefineKindOptions<T>} DefineKindOptions */
/** @template T @typedef {import('./types.js').KindFacet<T>} KindFacet */
/** @template T @typedef {import('./types.js').KindFacets<T>} KindFacets */
/** @typedef {import('./types.js').DurableKindHandle} DurableKindHandle */

/**
 * @template A,S,T
 * @param {string} tag
 * @param {any} interfaceGuard
 * @param {(...args: A[]) => S} init
 * @param {T} methods
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const defineVirtualFarClass = (
  tag,
  interfaceGuard,
  init,
  methods,
  options,
) =>
  // @ts-expect-error The use of `thisfulMethods` to change
  // the appropriate static type is the whole point of this method.
  defineKind(tag, init, methods, {
    ...options,
    thisfulMethods: true,
    interfaceGuard,
  });
harden(defineVirtualFarClass);

/**
 * @template A,S,T
 * @param {string} tag
 * @param {any} interfaceGuardKit
 * @param {(...args: A[]) => S} init
 * @param {T} facets
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const defineVirtualFarClassKit = (
  tag,
  interfaceGuardKit,
  init,
  facets,
  options,
) =>
  // @ts-expect-error The use of `thisfulMethods` to change
  // the appropriate static type is the whole point of this method.
  defineKindMulti(tag, init, facets, {
    ...options,
    thisfulMethods: true,
    interfaceGuard: interfaceGuardKit,
  });
harden(defineVirtualFarClassKit);

/**
 * @template A,S,T
 * @param {DurableKindHandle} kindHandle
 * @param {any} interfaceGuard
 * @param {(...args: A[]) => S} init
 * @param {T} methods
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const defineDurableFarClass = (
  kindHandle,
  interfaceGuard,
  init,
  methods,
  options,
) =>
  // @ts-expect-error The use of `thisfulMethods` to change
  // the appropriate static type is the whole point of this method.
  defineDurableKind(kindHandle, init, methods, {
    ...options,
    thisfulMethods: true,
    interfaceGuard,
  });
harden(defineDurableFarClass);

/**
 * @template A,S,T
 * @param {DurableKindHandle} kindHandle
 * @param {any} interfaceGuardKit
 * @param {(...args: A[]) => S} init
 * @param {T} facets
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const defineDurableFarClassKit = (
  kindHandle,
  interfaceGuardKit,
  init,
  facets,
  options,
) =>
  // @ts-expect-error The use of `thisfulMethods` to change
  // the appropriate static type is the whole point of this method.
  defineDurableKindMulti(kindHandle, init, facets, {
    ...options,
    thisfulMethods: true,
    interfaceGuard: interfaceGuardKit,
  });
harden(defineDurableFarClassKit);

/**
 * @template A,S,T
 * @param {Baggage} baggage
 * @param {string} kindName
 * @param {any} interfaceGuard
 * @param {(...args: A[]) => S} init
 * @param {T} methods
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const vivifyFarClass = (
  baggage,
  kindName,
  interfaceGuard,
  init,
  methods,
  options = undefined,
) =>
  defineDurableFarClass(
    provideKindHandle(baggage, kindName),
    interfaceGuard,
    init,
    methods,
    options,
  );
harden(vivifyFarClass);

/**
 * @template A,S,T
 * @param {Baggage} baggage
 * @param {string} kindName
 * @param {any} interfaceGuardKit
 * @param {(...args: A[]) => S} init
 * @param {T} facets
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {(...args: A[]) => (T & RemotableBrand<{}, T>)}
 */
export const vivifyFarClassKit = (
  baggage,
  kindName,
  interfaceGuardKit,
  init,
  facets,
  options = undefined,
) =>
  defineDurableFarClassKit(
    provideKindHandle(baggage, kindName),
    interfaceGuardKit,
    init,
    facets,
    options,
  );
harden(vivifyFarClassKit);

/**
 * @template T,M
 * @param {Baggage} baggage
 * @param {string} kindName
 * @param {InterfaceGuard|undefined} interfaceGuard
 * @param {M} methods
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {T & RemotableBrand<{}, T>}
 */
export const vivifyFarInstance = (
  baggage,
  kindName,
  interfaceGuard,
  methods,
  options = undefined,
) => {
  const makeSingleton = vivifyFarClass(
    baggage,
    kindName,
    interfaceGuard,
    initEmpty,
    methods,
    options,
  );

  // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error -- https://github.com/Agoric/agoric-sdk/issues/4620
  // @ts-ignore could be instantiated with an arbitrary type
  return provide(baggage, `the_${kindName}`, () => makeSingleton());
};
harden(vivifyFarInstance);

/**
 * @deprecated Use vivifyFarInstance instead.
 * @template T
 * @param {Baggage} baggage
 * @param {string} kindName
 * @param {T} methods
 * @param {DefineKindOptions<unknown>} [options]
 * @returns {T & RemotableBrand<{}, T>}
 */
export const vivifySingleton = (
  baggage,
  kindName,
  methods,
  options = undefined,
) => vivifyFarInstance(baggage, kindName, undefined, methods, options);
harden(vivifySingleton);
