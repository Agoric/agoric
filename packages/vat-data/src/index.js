// @jessie-check

/// <reference types="ses" />
export {
  M,
  makeScalarMapStore,
  makeScalarWeakMapStore,
  makeScalarSetStore,
  makeScalarWeakSetStore,
} from '@agoric/store';
export {
  makeKindHandle,
  providePromiseWatcher,
  watchPromise,
  makeScalarBigMapStore,
  makeScalarBigWeakMapStore,
  makeScalarBigSetStore,
  makeScalarBigWeakSetStore,
  canBeDurable,
  pickFacet,
  partialAssign,
  provide,
  provideDurableMapStore,
  provideDurableWeakMapStore,
  provideDurableSetStore,
  provideDurableWeakSetStore,
} from './vat-data-bindings.js';
export {
  defineVirtualExoClass,
  defineVirtualExoClassKit,
  defineDurableExoClass,
  defineDurableExoClassKit,
  prepareExoClass,
  prepareExoClassKit,
  prepareExo,
} from './exo-utils.js';

// TODO re-export these
/**
 * @template T @typedef
 *   {import('@agoric/swingset-liveslots').DefineKindOptions<T>}
 *   DefineKindOptions
 */
// Copy this type because aliasing it by `import('@agoric/swingset-liveslots').Baggage`
// causes this error in typedoc: Expected a symbol for node with kind Identifier
/** @typedef {MapStore<string, any>} Baggage */
