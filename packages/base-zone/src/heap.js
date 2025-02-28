// @ts-check
// @jessie-check

import { Far, isPassable } from '@endo/pass-style';
import { Fail } from '@endo/errors';
import {
  makeExo,
  defineExoClass as rawDefineExoClass,
  defineExoClassKit as rawDefineExoClassKit,
} from '@endo/exo';
import {
  makeScalarMapStore,
  makeScalarSetStore,
  makeScalarWeakMapStore,
  makeScalarWeakSetStore,
} from '@agoric/store';

import { makeOnceKit } from './make-once.js';
import { agoricVatDataKeys as keys } from './keys.js';
import { watchPromise } from './watch-promise.js';
import { provideStateMaker } from './heap-exo-state.js';

/**
 * @import {StateShape} from '@endo/exo'
 */

/**
 * @type {import('./types.js').Stores}
 */
const detachedHeapStores = Far('heapStores', {
  detached: () => detachedHeapStores,
  isStorable: isPassable,

  setStore: makeScalarSetStore,
  mapStore: makeScalarMapStore,
  weakMapStore: makeScalarWeakMapStore,
  weakSetStore: makeScalarWeakSetStore,
});

/**
 * @template {(...args: any[]) => any} I
 * @param {I} init
 * @param {StateShape | undefined} stateShape
 */
const wrapExoInit = (init, stateShape) => {
  harden(stateShape);
  detachedHeapStores.isStorable(stateShape) ||
    Fail`stateShape must be storable`;

  const makeState = provideStateMaker(stateShape);

  const wrappedInit = /** @type {I} */ (
    (...args) => {
      const initialData = init ? init(...args) : {};

      typeof initialData === 'object' ||
        Fail`initial data must be object, not ${initialData}`;
      return makeState(initialData);
    }
  );
  return wrappedInit;
};

/** @type {typeof rawDefineExoClass} */
const defineExoClass = (
  tag,
  interfaceGuard,
  rawInit,
  methods,
  { stateShape, ...otherOptions } = {},
) =>
  rawDefineExoClass(
    tag,
    interfaceGuard,
    wrapExoInit(rawInit, stateShape),
    methods,
    otherOptions,
  );

/** @type {typeof rawDefineExoClassKit} */
const defineExoClassKit = (
  tag,
  interfaceGuardKit,
  rawInit,
  methodsKit,
  { stateShape, ...otherOptions } = {},
) =>
  rawDefineExoClassKit(
    tag,
    interfaceGuardKit,
    wrapExoInit(rawInit, stateShape),
    methodsKit,
    otherOptions,
  );

/**
 * Create a heap (in-memory) zone that uses the default exo and store implementations.
 *
 * @param {string} [baseLabel]
 * @returns {import('./types.js').Zone}
 */
export const makeHeapZone = (baseLabel = 'heapZone') => {
  const { makeOnce, wrapProvider } = makeOnceKit(baseLabel, detachedHeapStores);

  /**
   * @param {string} label
   * @param {any} _options
   */
  const makeSubZone = (label, _options) =>
    makeHeapZone(`${baseLabel}.${label}`);

  return Far('heapZone', {
    exo: wrapProvider(makeExo, keys.exo),
    exoClass: wrapProvider(defineExoClass, keys.exoClass),
    exoClassKit: wrapProvider(defineExoClassKit, keys.exoClassKit),
    subZone: wrapProvider(makeSubZone),

    makeOnce,
    watchPromise,
    detached: detachedHeapStores.detached,
    isStorable: detachedHeapStores.isStorable,

    mapStore: wrapProvider(detachedHeapStores.mapStore),
    setStore: wrapProvider(detachedHeapStores.setStore),
    weakMapStore: wrapProvider(detachedHeapStores.weakMapStore),
    weakSetStore: wrapProvider(detachedHeapStores.weakSetStore),
  });
};
harden(makeHeapZone);
